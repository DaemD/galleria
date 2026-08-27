// The work. Order is the order they tile across the canvas.
// `label` is optional — leave it empty and the tile shows the film alone.
export const WORKS = [
  { src: './assets/tiles/01.mp4', label: '' },
  { src: './assets/tiles/02.mp4', label: '' },
  { src: './assets/tiles/03.mp4', label: '' },
  { src: './assets/tiles/04.mp4', label: '' },
  { src: './assets/tiles/05.mp4', label: '' },
  { src: './assets/tiles/06.mp4', label: '' },
  // grid expects 8 films — repeat two until you add more
  { src: './assets/tiles/01.mp4', label: '' },
  { src: './assets/tiles/02.mp4', label: '' }
];

// Edit LINKS if her Spotify share URL changes (Spotify app → Profile → Share → Copy link)
export const LINKS = {
  instagram: 'https://www.instagram.com/zenebbb_/',
  spotify: 'https://open.spotify.com/user/31ppqxrexrcg3nwcfbir4dav74xa',
};

// Text cards in the grid — tap opens the link in a new tab.
export const CARDS = [
  { text: 'instagram', href: LINKS.instagram },
  { text: 'spotify', href: LINKS.spotify },
];

// Background music — drop .mp3 files in assets/audio/ and add rows here.
// Order is play order; the last track advances to the first.
export const PLAYLIST = [
  { src: './assets/audio/Tory Lanez - Pink Material.mp3', title: 'Pink Material' },
  { src: './assets/audio/Secondhand (feat. Rema).mp3', title: 'Secondhand' },
  { src: './assets/audio/Ariana Grande - bye (lyric visualizer).mp3', title: 'bye' },
  { src: './assets/audio/Majid Jordan with Drake - Stars Align (Official Visualizer).mp3', title: 'Stars Align' },
];
