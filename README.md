# Podbean.js
A friendly NodeJS wrapper for the Podbean API

> **Note**
> This API wrapper is build with client credentials authorization in mind. If
> you need client side auth, or something else, this is probably not the library
> for you. 

## Installation
I use yarn.
```sh
yarn add podbean.js
```

## Usage
A quick example to demonstrate what this library can do at the time of writing:

```ts
import PodbeanAPI from "podbean.js";

const CLIENT_ID = 'yourClientId'
const CLIENT_SECRET = 'yourClientSecret';

const podbean = new PodbeanAPI({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });

podbean.login().then(async () => {
  // grab basic podcast details
  const podcast = await podbean.podcast();
  console.log(`${podcast.title} (Status: ${podcast.status}) [ID: ${podcast.id}]`)
  console.log(podcast.description);

  const [episodes, count, hasMore] = await podbean.fetchEpisodes();
  console.log(`\nDone fetching episodes. Total Fetched: ${count}\n`);
  episodes.forEach((it, idx) => {
    console.log(`${it.episodeNumber} - ${it.title} (Status: ${it.status}) [ID: ${it.id}]`);
    console.log(`\tCreated: ${it.publishTime}`);
    console.log(`\t${it.duration ? `Duration: ${it.duration}` : 'Duration: 00:00 (No file)'}`);
    if (idx + 1 !== episodes.length) console.log(''); // spacer
  });

  console.log(
    hasMore 
      ? '\nThere are more episodes available'
      : '\nThere are no more episodes available'
  )
});
```

## License
This project is governed under the permissive [MIT License](LICENSE).