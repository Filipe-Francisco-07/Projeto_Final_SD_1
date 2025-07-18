# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: music.proto
# Protobuf Python Version: 5.26.1
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from google.protobuf import empty_pb2 as google_dot_protobuf_dot_empty__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0bmusic.proto\x12\ttunechain\x1a\x1bgoogle/protobuf/empty.proto\"V\n\x0cMusicRequest\x12\r\n\x05title\x18\x01 \x01(\t\x12\x0e\n\x06\x61rtist\x18\x02 \x01(\t\x12\x10\n\x08producer\x18\x03 \x01(\t\x12\x15\n\rrevenue_split\x18\x04 \x01(\x05\"+\n\x0bPlayRequest\x12\r\n\x05title\x18\x01 \x01(\t\x12\r\n\x05times\x18\x02 \x01(\x05\"1\n\rMusicResponse\x12\x0f\n\x07success\x18\x01 \x01(\x08\x12\x0f\n\x07message\x18\x02 \x01(\t\"s\n\tMusicData\x12\r\n\x05title\x18\x01 \x01(\t\x12\x0e\n\x06\x61rtist\x18\x02 \x01(\t\x12\x10\n\x08producer\x18\x03 \x01(\t\x12\x15\n\rrevenue_split\x18\x04 \x01(\x05\x12\r\n\x05plays\x18\x05 \x01(\x05\x12\x0f\n\x07revenue\x18\x06 \x01(\x01\x32\xcf\x01\n\x0cMusicService\x12\x42\n\rRegisterMusic\x12\x17.tunechain.MusicRequest\x1a\x18.tunechain.MusicResponse\x12<\n\nListMusics\x12\x16.google.protobuf.Empty\x1a\x14.tunechain.MusicData0\x01\x12=\n\tPlayMusic\x12\x16.tunechain.PlayRequest\x1a\x18.tunechain.MusicResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'music_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_MUSICREQUEST']._serialized_start=55
  _globals['_MUSICREQUEST']._serialized_end=141
  _globals['_PLAYREQUEST']._serialized_start=143
  _globals['_PLAYREQUEST']._serialized_end=186
  _globals['_MUSICRESPONSE']._serialized_start=188
  _globals['_MUSICRESPONSE']._serialized_end=237
  _globals['_MUSICDATA']._serialized_start=239
  _globals['_MUSICDATA']._serialized_end=354
  _globals['_MUSICSERVICE']._serialized_start=357
  _globals['_MUSICSERVICE']._serialized_end=564
# @@protoc_insertion_point(module_scope)
