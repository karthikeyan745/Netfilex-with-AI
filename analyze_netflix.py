import os
import sqlite3
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Create directories if they don't exist
os.makedirs("images", exist_ok=True)

print("Starting Netflix Data Analysis...")

# 1. LOAD DATA
# The dataset has been downloaded as netflix_titles.csv
try:
    df = pd.read_csv("netflix_titles.csv", encoding="utf-8")
    print(f"Data loaded successfully. Shape: {df.shape}")
except UnicodeDecodeError:
    df = pd.read_csv("netflix_titles.csv", encoding="latin-1")
    print(f"Data loaded with latin-1 encoding. Shape: {df.shape}")

# 2. DATA CLEANING
print("\n--- Data Cleaning and Feature Engineering ---")

# Check for duplicates
duplicates_count = df.duplicated(subset=['title', 'type', 'release_year', 'director']).sum()
print(f"Identified duplicates based on ('title', 'type', 'release_year', 'director'): {duplicates_count}")
if duplicates_count > 0:
    df = df.drop_duplicates(subset=['title', 'type', 'release_year', 'director'], keep='first')
    print(f"Duplicates removed. New shape: {df.shape}")
else:
    print("No duplicates found.")

# Handling null values
print("Handling null values...")
# director: 2389 missing. Fill with 'Unknown Director'
df['director'] = df['director'].fillna('Unknown Director')

# cast: 718 missing. Fill with 'Unknown Cast'
df['cast'] = df['cast'].fillna('Unknown Cast')

# country: 507 missing. Fill with 'Unknown Country'
df['country'] = df['country'].fillna('Unknown Country')

# date_added: 10 missing. Since it is very small, we drop these records.
# Explain in report: we drop them because date_added is critical for growth and seasonal analysis, and 10 rows is < 0.13% of the dataset.
df = df.dropna(subset=['date_added'])
print(f"Dropped rows with missing date_added. New shape: {df.shape}")

# rating: 7 missing. Fill with 'UR' (Unrated)
df['rating'] = df['rating'].fillna('UR')

print("Null values count after cleaning:")
print(df.isnull().sum())

# Standarize and convert columns
print("Standardizing text and converting date columns...")
df['title'] = df['title'].str.strip()
df['director'] = df['director'].str.strip()
df['cast'] = df['cast'].str.strip()
df['country'] = df['country'].str.strip()
df['rating'] = df['rating'].str.strip().str.upper()

# Convert date_added to datetime
# Example format: "August 14, 2020" or " August 14, 2020"
df['date_added'] = df['date_added'].str.strip()
df['date_added_dt'] = pd.to_datetime(df['date_added'], format='%B %d, %Y', errors='coerce')

# Check if any dates failed to parse
unparsed_dates = df[df['date_added_dt'].isnull()]['date_added']
if len(unparsed_dates) > 0:
    print(f"Warning: {len(unparsed_dates)} dates failed to parse. Attempting mixed format parsing...")
    df['date_added_dt'] = pd.to_datetime(df['date_added'], errors='coerce')

# Re-check for nulls in date_added_dt, fill them with mode or drop.
df = df.dropna(subset=['date_added_dt'])
print(f"Final shape after date parsing: {df.shape}")

# Extract features
df['year_added'] = df['date_added_dt'].dt.year.astype(int)
df['month_added'] = df['date_added_dt'].dt.month.astype(int)
df['month_name_added'] = df['date_added_dt'].dt.month_name()
df['day_added'] = df['date_added_dt'].dt.day.astype(int)
df['day_name_added'] = df['date_added_dt'].dt.day_name()

# Process duration column
# Movies: "90 min", TV Shows: "3 Seasons"
print("Processing duration column...")
df['duration_num'] = df['duration'].str.extract(r'(\d+)').astype(float)
df['duration_unit'] = df['duration'].str.extract(r'([a-zA-Z]+)')

# Split into Movies and TV Shows dataframes for stats
movies_df = df[df['type'] == 'Movie'].copy()
tvshows_df = df[df['type'] == 'TV Show'].copy()

# Save cleaned dataset
df.to_csv("netflix_titles_cleaned.csv", index=False)
print("Cleaned dataset saved as netflix_titles_cleaned.csv")


# 3. STATISTICAL INSIGHTS
print("\n--- Calculating Statistical Insights ---")
movie_durations = movies_df['duration_num']
tv_show_seasons = tvshows_df['duration_num']

stats_dict = {
    "Metric": ["Mean", "Median", "Mode", "Std Dev", "Min", "Max", "25th Percentile (Q1)", "75th Percentile (Q3)"],
    "Movie Duration (min)": [
        movie_durations.mean(),
        movie_durations.median(),
        movie_durations.mode()[0] if not movie_durations.mode().empty else np.nan,
        movie_durations.std(),
        movie_durations.min(),
        movie_durations.max(),
        movie_durations.quantile(0.25),
        movie_durations.quantile(0.75)
    ],
    "TV Show Seasons": [
        tv_show_seasons.mean(),
        tv_show_seasons.median(),
        tv_show_seasons.mode()[0] if not tv_show_seasons.mode().empty else np.nan,
        tv_show_seasons.std(),
        tv_show_seasons.min(),
        tv_show_seasons.max(),
        tv_show_seasons.quantile(0.25),
        tv_show_seasons.quantile(0.75)
    ]
}
stats_df = pd.DataFrame(stats_dict)
print(stats_df.to_string(index=False))

# Outlier Detection for Movies (using IQR)
q1 = movie_durations.quantile(0.25)
q3 = movie_durations.quantile(0.75)
iqr = q3 - q1
lower_bound = q1 - 1.5 * iqr
upper_bound = q3 + 1.5 * iqr
outliers = movies_df[(movies_df['duration_num'] < lower_bound) | (movies_df['duration_num'] > upper_bound)]
print(f"\nMovie Duration Outliers (IQR Method):")
print(f"Q1: {q1} min, Q3: {q3} min, IQR: {iqr} min")
print(f"Lower Bound: {lower_bound} min, Upper Bound: {upper_bound} min")
print(f"Number of Outliers: {outliers.shape[0]} ({outliers.shape[0]/movies_df.shape[0]*100:.2f}% of movies)")


# 4. BUSINESS KPIS
print("\n--- Calculating Business KPIs ---")
kpis = {
    "Total Titles": len(df),
    "Total Movies": len(movies_df),
    "Total TV Shows": len(tvshows_df),
    "Average Movie Duration (min)": movie_durations.mean(),
    "Average TV Show Seasons": tv_show_seasons.mean(),
    "Top Genre (Movies)": movies_df['listed_in'].str.split(', ').explode().mode()[0],
    "Top Genre (TV Shows)": tvshows_df['listed_in'].str.split(', ').explode().mode()[0],
    "Top Producing Country": df[df['country'] != 'Unknown Country']['country'].str.split(', ').explode().mode()[0],
    "Top Content Rating": df['rating'].mode()[0],
    "Latest Year Added": int(df['year_added'].max()),
    "First Year Added": int(df['year_added'].min())
}
for k, v in kpis.items():
    print(f"{k}: {v}")


# 5. DATA VISUALIZATIONS
print("\n--- Generating Visualization Charts ---")
# Use clean dark-mode-like styles or high-contrast clean styles.
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 12
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10

netflix_colors = ['#E50914', '#221F1F', '#F5F5F1', '#333333']

# Chart 1: Movies vs TV Shows
plt.figure(figsize=(6, 6))
type_counts = df['type'].value_counts()
plt.pie(type_counts, labels=type_counts.index, autopct='%1.1f%%', colors=['#E50914', '#221F1F'], 
        startangle=90, textprops={'fontsize': 12, 'weight': 'bold'}, explode=(0.05, 0), shadow=True)
plt.title("Distribution of Netflix Content: Movies vs TV Shows", fontsize=14, weight='bold', pad=20)
plt.tight_layout()
plt.savefig("images/movies_vs_tvshows.png", dpi=150)
plt.close()

# Chart 2: Content Added by Year
plt.figure(figsize=(10, 6))
yearly_added = df.groupby(['year_added', 'type']).size().unstack(fill_value=0)
# Filter for years 2008 to 2021 (active netflix growth years)
yearly_added = yearly_added.loc[2008:2021]
plt.plot(yearly_added.index, yearly_added['Movie'], marker='o', color='#E50914', linewidth=2.5, label='Movies')
plt.plot(yearly_added.index, yearly_added['TV Show'], marker='s', color='#221F1F', linewidth=2.5, label='TV Shows')
plt.title("Growth of Netflix Content Catalog (2008 - 2021)", fontsize=14, weight='bold', pad=15)
plt.xlabel("Year Added")
plt.ylabel("Number of Titles Added")
plt.xticks(yearly_added.index, rotation=45)
plt.legend()
plt.tight_layout()
plt.savefig("images/content_added_over_time.png", dpi=150)
plt.close()

# Chart 3: Top Country-wise Distribution
plt.figure(figsize=(10, 6))
# Split countries and count
countries_series = df[df['country'] != 'Unknown Country']['country'].str.split(', ').explode()
top_countries = countries_series.value_counts().head(10)
sns.barplot(x=top_countries.values, y=top_countries.index, hue=top_countries.index, legend=False, palette="Reds_r")
plt.title("Top 10 Content Producing Countries on Netflix", fontsize=14, weight='bold', pad=15)
plt.xlabel("Number of Titles")
plt.ylabel("Country")
plt.tight_layout()
plt.savefig("images/top_countries.png", dpi=150)
plt.close()

# Chart 4: Rating Distribution
plt.figure(figsize=(10, 6))
rating_counts = df['rating'].value_counts().head(10)
sns.barplot(x=rating_counts.index, y=rating_counts.values, color='#E50914')
plt.title("Distribution of Content Ratings on Netflix (Top 10 Ratings)", fontsize=14, weight='bold', pad=15)
plt.xlabel("Rating Category")
plt.ylabel("Number of Titles")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("images/rating_distribution.png", dpi=150)
plt.close()

# Chart 5: Movie Duration Distribution
plt.figure(figsize=(10, 6))
sns.histplot(movies_df['duration_num'], bins=30, kde=True, color='#E50914')
plt.title("Distribution of Movie Durations on Netflix", fontsize=14, weight='bold', pad=15)
plt.xlabel("Duration (Minutes)")
plt.ylabel("Count")
plt.axvline(movie_durations.mean(), color='#221F1F', linestyle='--', linewidth=1.5, label=f'Mean: {movie_durations.mean():.1f} min')
plt.axvline(movie_durations.median(), color='blue', linestyle='-', linewidth=1.5, label=f'Median: {movie_durations.median():.1f} min')
plt.legend()
plt.tight_layout()
plt.savefig("images/movie_duration_distribution.png", dpi=150)
plt.close()

# Chart 6: TV Show Seasons Distribution
plt.figure(figsize=(10, 6))
tv_seasons_counts = tvshows_df['duration_num'].value_counts().sort_index()
sns.barplot(x=tv_seasons_counts.index.astype(int), y=tv_seasons_counts.values, color='#221F1F')
plt.title("Distribution of TV Show Seasons on Netflix", fontsize=14, weight='bold', pad=15)
plt.xlabel("Number of Seasons")
plt.ylabel("Number of TV Shows")
plt.tight_layout()
plt.savefig("images/tv_show_seasons_distribution.png", dpi=150)
plt.close()

# Chart 7: Box Plot for Movie Durations (Outlier visualization)
plt.figure(figsize=(8, 4))
sns.boxplot(x=movies_df['duration_num'], color='#E50914')
plt.title("Box Plot of Movie Durations showing Outliers", fontsize=14, weight='bold', pad=15)
plt.xlabel("Duration (Minutes)")
plt.tight_layout()
plt.savefig("images/duration_boxplot.png", dpi=150)
plt.close()

# Chart 8: Top Genres (All Catalog)
plt.figure(figsize=(10, 6))
genres_series = df['listed_in'].str.split(', ').explode()
top_genres = genres_series.value_counts().head(10)
sns.barplot(x=top_genres.values, y=top_genres.index, color='#E50914')
plt.title("Top 10 Genres in Netflix Catalog", fontsize=14, weight='bold', pad=15)
plt.xlabel("Number of Titles")
plt.ylabel("Genre")
plt.tight_layout()
plt.savefig("images/top_genres.png", dpi=150)
plt.close()

# Chart 9: Content Added by Month (Seasonal Trends)
plt.figure(figsize=(10, 6))
month_order = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
monthly_added_counts = df['month_name_added'].value_counts().reindex(month_order)
sns.barplot(x=monthly_added_counts.index, y=monthly_added_counts.values, color='#E50914')
plt.title("Seasonal Content Releases: Titles Added by Month", fontsize=14, weight='bold', pad=15)
plt.xlabel("Month")
plt.ylabel("Number of Titles Added")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("images/monthly_seasonal_trends.png", dpi=150)
plt.close()

print("All charts generated and saved in 'images/' folder!")


# 6. SQL ANALYSIS (SQLite Setup and Queries)
print("\n--- Executing SQL Analysis ---")
db_conn = sqlite3.connect("netflix.db")
cursor = db_conn.cursor()

# Register custom python helper to safely format JSON lists in SQLite
import json
def make_json_array(text):
    if not text or pd.isna(text):
        return '[]'
    items = [x.strip() for x in text.split(',') if x.strip()]
    return json.dumps(items)

db_conn.create_function("make_json_array", 1, make_json_array)

# Create SQLite table and import cleaned dataframe
df_sql = df.copy()
# Remove datetime object before sending to SQLite
df_sql['date_added_dt'] = df_sql['date_added_dt'].dt.strftime('%Y-%m-%d')
df_sql.to_sql("netflix_titles", db_conn, if_exists="replace", index=False)
print("Data written to 'netflix_titles' table in netflix.db database.")

# List of SQL Queries and execution
queries = {
    "Top 10 Genres": """
        SELECT value as genre, COUNT(*) as title_count
        FROM netflix_titles, json_each(make_json_array(listed_in))
        GROUP BY genre
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Top Countries": """
        SELECT value as country_name, COUNT(*) as title_count
        FROM netflix_titles, json_each(make_json_array(country))
        WHERE country_name != 'Unknown Country'
        GROUP BY country_name
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Most Active Years Added": """
        SELECT year_added, COUNT(*) as title_count
        FROM netflix_titles
        GROUP BY year_added
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Director Rankings": """
        SELECT value as director_name, COUNT(*) as title_count
        FROM netflix_titles, json_each(make_json_array(director))
        WHERE director_name != 'Unknown Director'
        GROUP BY director_name
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Rating Distribution": """
        SELECT rating, COUNT(*) as title_count, 
               ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM netflix_titles)), 2) as percentage
        FROM netflix_titles
        GROUP BY rating
        ORDER BY title_count DESC;
    """,
    "Average Movie Duration": """
        SELECT AVG(duration_num) as avg_duration_minutes,
               MIN(duration_num) as min_duration,
               MAX(duration_num) as max_duration
        FROM netflix_titles
        WHERE type = 'Movie';
    """,
    "Movies Released After 2020": """
        SELECT title, director, country, release_year
        FROM netflix_titles
        WHERE type = 'Movie' AND release_year > 2020
        LIMIT 5;
    """,
    "TV Shows with Multiple Seasons": """
        SELECT title, duration as seasons_count
        FROM netflix_titles
        WHERE type = 'TV Show' AND duration_num > 1
        ORDER BY duration_num DESC
        LIMIT 10;
    """,
    "Top Actors (Cast Members)": """
        SELECT value as actor_name, COUNT(*) as title_count
        FROM netflix_titles, json_each(make_json_array(cast))
        WHERE actor_name != 'Unknown Cast'
        GROUP BY actor_name
        ORDER BY title_count DESC
        LIMIT 10;
    """,
    "Year-over-Year Growth Table": """
        WITH yearly_counts AS (
            SELECT year_added, COUNT(*) as current_count
            FROM netflix_titles
            WHERE year_added BETWEEN 2008 AND 2021
            GROUP BY year_added
        )
        SELECT year_added, current_count,
               LAG(current_count) OVER (ORDER BY year_added) as previous_count,
               ROUND(((current_count - LAG(current_count) OVER (ORDER BY year_added)) * 100.0 / LAG(current_count) OVER (ORDER BY year_added)), 2) as yoy_growth_pct
        FROM yearly_counts;
    """
}

# Run each query and write outputs to sql_results.txt
with open("sql_results.txt", "w", encoding="utf-8") as f:
    for q_name, q_str in queries.items():
        f.write(f"=== {q_name} ===\nQuery:\n{q_str.strip()}\n\nResults:\n")
        try:
            res_df = pd.read_sql_query(q_str, db_conn)
            f.write(res_df.to_string(index=False))
            f.write("\n\n" + "="*50 + "\n\n")
            print(f"Executed query: {q_name}")
        except Exception as e:
            f.write(f"Error executing query: {e}\n\n")
            print(f"Failed to execute query: {q_name}. Error: {e}")

db_conn.close()
print("SQL Analysis completed! Results saved to 'sql_results.txt'")
print("Analysis run successfully!")
