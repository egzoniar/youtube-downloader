const express = require('express')
const fs = require('fs')
const contentDisposition = require('content-disposition');
const ytdl = require('ytdl-core')
const app = express()

const DIR = __dirname + "/videos/"
const BASE_URL = "https://www.youtube.com/watch?v="

app.get('/', (req, res) => {
  const html = `
    <h3>Welcome to wetube (Youtube Downloader)</h3>
    <p>
      Request to <b>/download?videoId=[youtube-videoId-here]</b> </br>
      And your video should start downloading.
    </p>
  `
  res.status(200).send(html)
})

app.get('/download', (req, res) => {
  const { videoId } = req.query

  try {
    if (!videoId) throw new Error('You must provide the youtube video id')

    // get video info
    ytdl.getInfo(videoId, (err, info) => {
      if (err) throw new Error('You must provide a valid youtube videoId')

      const { title } = info

      // Download video from youtube
      const filename = title + '.mp4'

      res.set("Content-Disposition", contentDisposition(filename))

      const download = ytdl(BASE_URL + videoId).pipe(res)

      download.on('open', function () {
        console.log("Server is open for piping")
      });

      download.on('finish', () => res.end())

      download.on('error', function (err) {
        console.log(err)
        res.end(err);
      });
    });
  }
  catch (err) {
    res.status(404).send(err)
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))