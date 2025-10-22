from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["recrutement"]

# Affiche les collections existantes
print(db.list_collection_names())
