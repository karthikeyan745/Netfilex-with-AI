import sqlite3
import pandas as pd

# Load cleaned data
df = pd.read_csv("netflix_titles_cleaned.csv")

# Create SQLite database connection
conn = sqlite3.connect("netflix.db")
cursor = conn.cursor()

print("Creating normalized schema in netflix.db...")

# Drop existing tables if they exist
cursor.execute("DROP TABLE IF EXISTS titles")
cursor.execute("DROP TABLE IF EXISTS title_directors")
cursor.execute("DROP TABLE IF EXISTS title_cast")
cursor.execute("DROP TABLE IF EXISTS title_genres")
cursor.execute("DROP TABLE IF EXISTS title_countries")

# Create main titles table (without multi-valued attributes: director, cast, country, listed_in)
cursor.execute("""
CREATE TABLE titles (
    show_id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    date_added TEXT,
    release_year INTEGER,
    rating TEXT,
    duration TEXT,
    duration_num REAL,
    duration_unit TEXT,
    description TEXT,
    year_added INTEGER,
    month_added INTEGER,
    month_name_added TEXT,
    day_added INTEGER,
    day_name_added TEXT
)
""")

# Create junction/normalized tables
cursor.execute("""
CREATE TABLE title_directors (
    show_id TEXT,
    director TEXT,
    PRIMARY KEY (show_id, director),
    FOREIGN KEY (show_id) REFERENCES titles (show_id)
)
""")

cursor.execute("""
CREATE TABLE title_cast (
    show_id TEXT,
    actor TEXT,
    PRIMARY KEY (show_id, actor),
    FOREIGN KEY (show_id) REFERENCES titles (show_id)
)
""")

cursor.execute("""
CREATE TABLE title_genres (
    show_id TEXT,
    genre TEXT,
    PRIMARY KEY (show_id, genre),
    FOREIGN KEY (show_id) REFERENCES titles (show_id)
)
""")

cursor.execute("""
CREATE TABLE title_countries (
    show_id TEXT,
    country TEXT,
    PRIMARY KEY (show_id, country),
    FOREIGN KEY (show_id) REFERENCES titles (show_id)
)
""")

print("Tables created. Inserting data...")

# Insert main titles data
titles_df = df[[
    'show_id', 'type', 'title', 'date_added', 'release_year', 'rating', 'duration',
    'duration_num', 'duration_unit', 'description', 'year_added', 'month_added',
    'month_name_added', 'day_added', 'day_name_added'
]].copy()

titles_df.to_sql("titles", conn, if_exists="append", index=False)
print(f"Inserted {len(titles_df)} rows into 'titles'.")

# Helper function to insert split data into normalized tables
def insert_normalized_data(df, column, table_name, target_col):
    rows_to_insert = []
    for _, row in df.iterrows():
        show_id = row['show_id']
        val_str = row[column]
        if pd.isna(val_str) or val_str == '' or val_str in ['Unknown Director', 'Unknown Cast', 'Unknown Country']:
            continue
        vals = [v.strip() for v in str(val_str).split(',') if v.strip()]
        for val in vals:
            rows_to_insert.append((show_id, val))
    
    # Remove duplicates if any
    unique_rows = list(set(rows_to_insert))
    
    # Batch insert
    cursor.executemany(f"INSERT OR IGNORE INTO {table_name} (show_id, {target_col}) VALUES (?, ?)", unique_rows)
    print(f"Inserted {len(unique_rows)} rows into '{table_name}'.")

# Insert normalized data
insert_normalized_data(df, 'director', 'title_directors', 'director')
insert_normalized_data(df, 'cast', 'title_cast', 'actor')
insert_normalized_data(df, 'listed_in', 'title_genres', 'genre')
insert_normalized_data(df, 'country', 'title_countries', 'country')

conn.commit()

# Run and save optimized SQL queries
print("\nRunning optimized SQL queries on normalized schema...")

queries = {
    "Top 10 Genres": """
        SELECT genre, COUNT(*) as title_count
        FROM title_genres
        GROUP BY genre
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Top Countries": """
        SELECT country, COUNT(*) as title_count
        FROM title_countries
        GROUP BY country
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Most Active Years Added": """
        SELECT year_added, COUNT(*) as title_count
        FROM titles
        GROUP BY year_added
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Director Rankings": """
        SELECT director, COUNT(*) as title_count
        FROM title_directors
        GROUP BY director
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Rating Distribution": """
        SELECT rating, COUNT(*) as title_count, 
               ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM titles)), 2) as percentage
        FROM titles
        GROUP BY rating
        ORDER BY title_count DESC;
    """,
    "Average Movie Duration": """
        SELECT AVG(duration_num) as avg_duration_minutes,
               MIN(duration_num) as min_duration,
               MAX(duration_num) as max_duration
        FROM titles
        WHERE type = 'Movie';
    """,
    "Movies Released After 2020": """
        SELECT title, release_year
        FROM titles
        WHERE type = 'Movie' AND release_year > 2020
        LIMIT 5;
    """,
    "TV Shows with Multiple Seasons": """
        SELECT title, duration as seasons_count
        FROM titles
        WHERE type = 'TV Show' AND duration_num > 1
        ORDER BY duration_num DESC
        LIMIT 10;
    """,
    "Top Actors (Cast Members)": """
        SELECT actor, COUNT(*) as title_count
        FROM title_cast
        GROUP BY actor
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Year-over-Year Growth Table": """
        WITH yearly_counts AS (
            SELECT year_added, COUNT(*) as current_count
            FROM titles
            WHERE year_added BETWEEN 2008 AND 2021
            GROUP BY year_added
        )
        SELECT year_added, current_count,
               LAG(current_count) OVER (ORDER BY year_added) as previous_count,
               ROUND(((current_count - LAG(current_count) OVER (ORDER BY year_added)) * 100.0 / LAG(current_count) OVER (ORDER BY year_added)), 2) as yoy_growth_pct
        FROM yearly_counts;
    """,
    "Director Productivity by Genre": """
        SELECT td.director, tg.genre, COUNT(*) as title_count
        FROM title_directors td
        JOIN title_genres tg ON td.show_id = tg.show_id
        GROUP BY td.director, tg.genre
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Top Actor-Director Collaborations": """
        SELECT td.director, tc.actor, COUNT(*) as collaboration_count
        FROM title_directors td
        JOIN title_cast tc ON td.show_id = tc.show_id
        GROUP BY td.director, tc.actor
        ORDER BY collaboration_count DESC
        LIMIT 10;
    """
}

# Run each query and write outputs to sql_results.txt
with open("sql_results.txt", "w", encoding="utf-8") as f:
    for q_name, q_str in queries.items():
        f.write(f"=== {q_name} ===\nQuery:\n{q_str.strip()}\n\nResults:\n")
        try:
            res_df = pd.read_sql_query(q_str, conn)
            f.write(res_df.to_string(index=False))
            f.write("\n\n" + "="*50 + "\n\n")
            print(f"Executed query: {q_name}")
        except Exception as e:
            f.write(f"Error executing query: {e}\n\n")
            print(f"Failed to execute query: {q_name}. Error: {e}")

conn.close()
print("Normalization database and SQL query execution completed! Results saved to 'sql_results.txt'")
