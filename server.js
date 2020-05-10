const express = require('express')
const fs = require('fs')
const contentDisposition = require('content-disposition');
const ytdl = require('ytdl-core')
const app = express()

const DIR = __dirname + "/videos/"
const BASE_URL = "https://www.youtube.com/watch?v="

// const readStream = fs.createReadStream(__dirname + '/video.mp4', 'base64')

// readStream.on('data', chunk => {
//   console.log('new chunk recieved')
//   console.log(chunk)
// })



// app.get('/', (req, res) => {
//   ytdl.getInfo(req.query.videoId, (err, info) => {
//     if (err) throw err;
//     const { player_response: { videoDetails } } = info
//     console.log(info.formats[0].contentLength)
//   });
// })



app.get('/download', (req, res) => {
  const { videoId } = req.query

  try {
    if (!videoId) throw new Error('You must provide the youtube video id')

    // get video info
    ytdl.getInfo(videoId, (err, info) => {
      if (err) throw new Error('You must provide a valid youtube videoId')

      const { title } = info

      // Download video from youtube
      const download = ytdl(BASE_URL + videoId).pipe(fs.createWriteStream(DIR + title + '.mp4'));

      download.on('finish', () => {
        // This line opens the file as a readable stream
        const readStream = fs.createReadStream(DIR + title + '.mp4');

        // This will wait until we know the readable stream is actually valid before piping
        readStream.on('open', function () {
          // This just pipes the read stream to the response object (which goes to the client)
          // res.set("Content-Disposition", "attachment;filename=" + title + '.mp4')
          res.set("Content-Disposition", contentDisposition(title + '.mp4'))
          readStream.pipe(res);
        });

        // This catches any errors that happen while creating the readable stream (usually invalid names)
        readStream.on('error', function (err) {
          res.end(err);
        });
      })

    });
  }
  catch (err) {
    res.status(404).send(err)
  }
})


// const url = 'https://www.youtube.com/watch?v=20-hBBasCGE' // quran
// const url = 'https://www.youtube.com/watch?v=2uMc3rNnTo4' // 1hr video
//const url = 'https://www.youtube.com/watch?v=EDul4jJQA2I' // spiderman
// const url = 'https://www.youtube.com/watch?v=NUKKzdVy0EI' // 4hr
// const videoID = 'EDul4jJQA2I'
// ytdl(url).pipe(fs.createWriteStream(filename));

// ytdl.getInfo(videoID, (err, info) => {
//   if (err) throw err;
//   const { player_response: { videoDetails } } = info
//   const { short_view_count_text } = info
//   console.log(videoDetails)
// });

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))