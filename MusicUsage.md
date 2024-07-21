# Notices and Importances

> [!IMPORTANT]
> - All music files are available for download to everyone! Please be agree about the copyright property of VJDY Official Productions. Games OSTs are credited to the respective companies.

> [!NOTE]
> This music is available for use in your videos without the requirement to distribute it through Music Distribution services.

> [!TIP]
> # Credits and Attribution
> ## YouTube
> ### If you are only using this music on your video, please specify the following:
> For YouTube Content `Music from VJDY Official Music Store - Link: https://bit.ly/VJDYMusicStore`
> 
> For YouTube Shorts `Music by @vjdyofficialmusic` if you are using video editing software such as **PowerDirector**, **Inshot**, and **CapCut**. this is not needed if you are remix the video's original sound from the Music Store channel on YouTube App.
> 
> ### If you are using my music and you use music from other sources, please put this in more specific:
> 
> `Parts of the chapter on this video uses music from VJDY Official Music Store - Link: https://bit.ly/VJDYMusicStore`
>
> _Some other music are labeled as _non-commercial_ or _personal_ use only. You must give the attribution to use for commercial purposes. But the owner will not needed to add attribution for the use of **personal use-only music** on commercial purposes._
>
> ## Instagram
> ### Use one of these techniques:
> In the description `Music by @vjdyofficial`
> 
> In the Audio Page `<music title> by vjdyofficial`
>
> _Some of the most popular music I created will be uploaded as visualization video on Instagram Reels, and you can use it in your posts by saving the audio of the reel._
>
> ## TikTok
> Due to some several copyright guidelines, You may be not allowed to use the whole part of the music as expected. To ensure, you can use **CapCut's copyright check feature** in my music to check for copyrights. If there's nothing to show the lists of copyright, means that the music is safe to use.

> [!WARNING]
> ## DO'S
> 1. Mention the music metadata on the video.
> 2. Embedded Album Art can be use in your video, that will be appreciated.
> 3. Using any of this music on your YouTube Channel's TV Series, such as _Clot Delora_ will be a nice touch.
> 4. Using this music as **scoring music scene** will also a excellent touch.
> ## DONT'S
> 1. Do **NOT** abuse of using music.
> 2. Do **NOT** put your voice of your singing.
> 3. Do **NOT** remix and mashup, only one person can remix the music.
> 4. Do **NOT** claim as your own. including your title, your artist that is actually using the same progression from here.
> 5. Do **NOT** complain about the details of the music. I am not responsible for any suggestions and feedbacks.

> [!CAUTION]
> 1. You may not make available, distribute or perform the music files from this library separately from videos and other content into which you have incorporated these music files (e.g., standalone distribution of these files is not permitted).
> 2. If the **bad procedures** has been found in the list of **DONT'S in warnings** on top, you will get a **copyright strike** on YouTube.
> 3. All Games Official Soundtrack are owned and credited to **the respective owners and companies**.

# Embed my music on your website
## Procedures
You will be able to embed my music on your website with the `audio` tag in HTML.
You can simply type this in the code editor:

|Type|Description|Code|
|---|---|---|
|Size to fit|This can use to resize the actual _div_ component to the parent component|`<div style"width:100%; height:100%">`|
|Audio Tag Beginning|This can use to initialize audio component.<br><br>There are strings that is used in **controlsList** tag:<br><br>`nodownload` This can prevent users from downloading if the website is intended only for music background play.<br>`noplaybackrate` This will disable the playback speed in Chromium-based browsers to prevent from speeding up or down. Firefox already disables playback speed.|`<audio style="width:100%; height:100%;" controls controlsList="noplaybackrate nodownload" name="media">`|
|Source Link and Mimetype|This will use to locate and use the audio file from the website directory or any CDN links. Using path from local storage is not allowed. **Be sure to check the Mimetype on the properties to add the mimetype string in the type tag.**.|`<source src="--music link--" type="audio/mpeg">`|
|Text|This will use to show if the browser doesn't support audio playback.|`"Sorry, your browser doesn't support audio playback to preview. please upgrade your browser."`|
|End of Audio Tag|This will close the audio tag.|`</audio>`|
|DIV Closure|This will close the tag and appended with the next one.|`</div>`|

## --music link-- string tip
This string `--music link--` is the segment to replace with the following:

`https://github.com/vjdyofficial/vjdyofficial/releases/download/vjdyofficialmusic-2022/--name--.mp3`

`https://github.com/vjdyofficial/vjdyofficial/releases/download/vjdyofficialmusic-2023/--name--.mp3`

`https://github.com/vjdyofficial/vjdyofficial/releases/download/vjdyofficialmusic-2024/--name--.mp3`

and this string `--name--` is the segment to replace the file name of the specific release links.
