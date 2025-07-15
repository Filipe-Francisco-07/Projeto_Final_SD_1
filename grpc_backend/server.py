import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'generated'))
import grpc # type: ignore
from concurrent import futures
import time
import pymongo # type: ignore
import generated.music_pb2 as music_pb2
import generated.music_pb2_grpc as music_pb2_grpc

class MusicService(music_pb2_grpc.MusicServiceServicer):
    def __init__(self):
        self.mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
        self.db = self.mongo_client["tunechain"]
        self.collection = self.db["musics"]

    def RegisterMusic(self, request, context):
        music_data = {
            "title": request.title,
            "artist": request.artist,
            "producer": request.producer,
            "revenue_split": request.revenue_split,
            "price_per_stream": 0.003,
            "plays": 0,
            "artist_revenue": 0.0,
            "sales": 0,
            "licenses": 0,
            "history": []
        }
        try:
            self.collection.insert_one(music_data)
            return music_pb2.MusicResponse(success=True, message="Música registrada com sucesso no MongoDB.")
        except Exception as e:
            return music_pb2.MusicResponse(success=False, message=str(e))

    def PlayMusic(self, request, context):
        musica = self.collection.find_one({ "title": request.title })
        if not musica:
            return music_pb2.MusicResponse(success=False, message="Música não encontrada.")

        vezes = request.times or 1
        split = musica.get("revenue_split", 0)
        price = musica.get("price_per_stream", 0.003)
        receita = price * split / 100 * vezes

        self.collection.update_one(
            { "_id": musica["_id"] },
            { "$inc": { "plays": vezes }, "$set": {
                "artist_revenue": musica.get("artist_revenue", 0.0) + receita,
                "history": musica.get("history", []) + [{ "type": "play", "value": receita }]
            }}
        )

        return music_pb2.MusicResponse(success=True, message=f"{vezes} plays registrados.")

    def GetStats(self, request, context):
        musica = self.collection.find_one({ "title": request.title })
        if not musica:
            return music_pb2.MusicStats(plays=0, revenue=0.0)
        return music_pb2.MusicStats(
            plays=musica.get("plays", 0),
            revenue=musica.get("artist_revenue", 0.0)
        )

    def ListMusics(self, request, context):
        for m in self.collection.find():
            yield music_pb2.MusicData(
                title=m.get("title", ""),
                artist=m.get("artist", ""),
                producer=m.get("producer", ""),
                revenue_split=m.get("revenue_split", 0),
                plays=m.get("plays", 0),
                revenue=m.get("artist_revenue", 0.0)
            )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    music_pb2_grpc.add_MusicServiceServicer_to_server(MusicService(), server)
    server.add_insecure_port('[::]:50051')
    print("Servidor gRPC rodando na porta 50051")
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        print("servidor fechado")
        server.stop(0)

if __name__ == '__main__':
    serve()
