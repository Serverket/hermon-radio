import NodeMediaServer from 'node-media-server';

// Start Node-Media-Server (RTMP ingest -> HLS output)
export function startNms() {
  const enabled = (process.env.STREAM_ENABLE || 'false').toLowerCase() === 'true';
  if (!enabled) {
    console.log('[NMS] STREAM_ENABLE is false. Skipping Node-Media-Server startup.');
    return null;
  }

  const rtmpPort = Number(process.env.STREAM_RTMP_PORT || 1935);
  const httpPort = Number(process.env.STREAM_HTTP_PORT || 8000);
  const appName = process.env.STREAM_APP || 'live';
  const allowOrigin = process.env.STREAM_ALLOW_ORIGIN || '*';
  const streamKey = process.env.STREAM_KEY || '';
  const ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
  const hlsTime = process.env.STREAM_HLS_TIME || '2';
  const hlsListSize = process.env.STREAM_HLS_LIST_SIZE || '6';

  const config = {
    logType: 2,
    rtmp: {
      port: rtmpPort,
      chunk_size: 4096,
      gop_cache: false,
      ping: 10,
      ping_timeout: 30,
    },
    http: {
      port: httpPort,
      mediaroot: './media',
      allow_origin: allowOrigin,
    },
    trans: {
      ffmpeg: ffmpegPath,
      tasks: [
        {
          app: appName,
          hls: true,
          hlsFlags: `[hls_time=${hlsTime}:hls_list_size=${hlsListSize}:hls_flags=delete_segments+independent_segments]`,
          mp4: false,
        },
      ],
    },
  };

  const nms = new NodeMediaServer(config);

  if (streamKey) {
    nms.on('prePublish', (id, StreamPath, args) => {
      const key = args.key || args.streamkey || '';
      if (key !== streamKey) {
        console.warn('[NMS] Rejecting publish, invalid key');
        const session = nms.getSession(id);
        session && session.reject();
      }
    });
  }

  nms.run();
  console.log(`[NMS] Running -> RTMP :${rtmpPort}, HTTP :${httpPort}, app "/${appName}"`);
  return nms;
}
