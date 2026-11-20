// Plain Terms and Privacy pages. TikTok's developer app requires a URL for each.

const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · homie social</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;color:#111}
h1{font-size:24px}h2{font-size:18px;margin-top:28px}</style></head><body>${body}</body></html>`;

export const TERMS = page('Terms of Service', `
<h1>homie social: Terms of Service</h1>
<p>Last updated: 20 November 2026</p>
<p>homie social is an internal publishing tool run by the homie team. It sends short videos made by homie to homie's own Instagram and TikTok accounts. It is not offered to the public, and only homie's team can use it.</p>
<h2>Use</h2>
<p>Every video is reviewed and approved by a person before it is sent. On TikTok, videos arrive as drafts in homie's inbox and are only published after a team member finishes the post in the TikTok app.</p>
<h2>Content</h2>
<p>All videos sent through the tool are original content created by homie. The tool does not copy content from other people or platforms.</p>
<h2>Third-party platforms</h2>
<p>Use of TikTok and Instagram through this tool is also subject to their own terms. homie social is not affiliated with or endorsed by TikTok or Meta.</p>
<h2>Contact</h2>
<p>meidan.gilad@gmail.com</p>`);

export const PRIVACY = page('Privacy Policy', `
<h1>homie social: Privacy Policy</h1>
<p>Last updated: 20 November 2026</p>
<p>homie social is an internal tool that posts homie's own videos to homie's own social accounts. It does not collect data from the public.</p>
<h2>What it stores</h2>
<ul>
<li>The sign-in tokens for homie's own TikTok and Instagram accounts, used only to upload videos and read the account name and post statistics.</li>
<li>The videos and captions queued for posting, and their posting status.</li>
<li>Public statistics of homie's own posts (views, likes and similar), shown on an internal dashboard.</li>
</ul>
<h2>What it does not do</h2>
<p>It does not collect, sell or share personal information about TikTok or Instagram users, and it does not read other accounts.</p>
<h2>Storage and deletion</h2>
<p>Data is stored on Cloudflare. Statistics are kept for 90 days. Disconnecting the account or asking us removes the stored tokens.</p>
<h2>Contact</h2>
<p>meidan.gilad@gmail.com</p>`);
