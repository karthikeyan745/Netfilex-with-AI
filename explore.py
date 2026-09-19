import pandas as pd

df = pd.read_csv("netflix_titles.csv")
print("Shape of DataFrame:", df.shape)
print("\nColumns and Data Types:")
print(df.dtypes)
print("\nNull Values:")
print(df.isnull().sum())
print("\nFirst 3 rows:")
print(df.head(3).to_string())
