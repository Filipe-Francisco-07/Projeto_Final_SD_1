import grpc # type: ignore
from pymongo import MongoClient # type: ignore
from google.protobuf import empty_pb2
import generated.music_pb2 as music_pb2
import generated.music_pb2_grpc as music_pb2_grpc

channel = grpc.insecure_channel("localhost:50051")
stub = music_pb2_grpc.MusicServiceStub(channel)

def grpc_register_music(title, artist, producer, revenue_split):
    request = music_pb2.MusicRequest(
        title=title,
        artist=artist,
        producer=producer,
        revenue_split=revenue_split
    )
    response = stub.RegisterMusic(request)
    return response.success, response.message

def grpc_play_music(title, vezes=1):
    request = music_pb2.PlayRequest(
        title=title,
        times=vezes
    )
    response = stub.PlayMusic(request)
    return response.success, response.message

def grpc_list_musics():
    grpc_musics = list(stub.ListMusics(empty_pb2.Empty()))

    client = MongoClient("mongodb://localhost:27017/")
    collection = client["tunechain"]["musics"]

    db_musics = {m["title"]: m for m in collection.find()}

    return [
        {
            "_id": str(db_musics[m.title]["_id"]),
            "title": m.title,
            "artist": m.artist,
            "producer": m.producer,
            "revenue_split": m.revenue_split,
            "plays": m.plays,
            "artist_revenue": m.revenue,
            "history": db_musics[m.title].get("history", [])
        }
        for m in grpc_musics
        if m.title in db_musics
    ]
