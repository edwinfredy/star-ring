
import json

input_file = "./src/assets/data/cities.json"
output_file = "./src/assets/data/cities_clean.json"

with open(input_file, "r", encoding="utf-8") as file:
    data = json.load(file)

for location in data:
    location[1] = float(location[1])
    location[2] = float(location[2])

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(data, file, separators=(',', ':'), ensure_ascii=False)

print(f"Converted JSON saved to {output_file}")
