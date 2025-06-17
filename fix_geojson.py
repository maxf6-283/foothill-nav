import json
from haversine import haversine, Unit

foothill = None
name = input("Path to geojson: ")
name = name if len(name) > 0 else "public/foothill.json"
with open(name) as file:
    foothill = json.load(file)

points_list = []

for feature in foothill["features"]:
    if feature["geometry"]["type"] == "LineString":
        for point in feature["geometry"]["coordinates"]:
            for point_2 in points_list:
                if haversine(point[::-1], point_2[::-1], unit=Unit.METERS) < 1.0:
                    if point[0] != point_2[0] or point[1] != point_2[1]:
                        print("combined points", haversine(point[::-1], point_2[::-1], unit=Unit.METERS), "meters apart")
                    point[0] = point_2[0]
                    point[1] = point_2[1]
                    break
            points_list.append(point)

path = input("Path to output: ")
path = path if len(path) > 0 else "public/foothill.json"
with open(path, "w") as file:
    json.dump(foothill, file, indent=2)

print("Dumped json to", path)