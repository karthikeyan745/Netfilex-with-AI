import os
import shutil

src_dir = "images"
dest_dir = r"C:\Users\ELCOT\.gemini\antigravity\brain\fad861d4-d7d7-46dc-af57-51196fb7e112\artifacts"

os.makedirs(dest_dir, exist_ok=True)
print(f"Created destination directory: {dest_dir}")

for file_name in os.listdir(src_dir):
    src_path = os.path.join(src_dir, file_name)
    dest_path = os.path.join(dest_dir, file_name)
    if os.path.isfile(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"Copied {file_name} to artifacts.")

print("Done copying assets!")
