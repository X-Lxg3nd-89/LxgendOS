# LxgendOS

A Simple Operating System that runs in your own Browser and includes multiple features and apps into a modern UI.


![alt text](<Screenshot 2026-10-07 at 22-06-55 LxgendOS.png>)

---

# Try It

Demo Link: https://x-lxg3nd-89.github.io/LxgendOS/

Dependencies - None (It works locally!)

---

# Current features

- **clock** which syncs with your current time

![alt text](image.png)

- **Calculator** app for basic numerical operations 

![alt text](image-1.png)

- **Notepad** for writing down stuff and can be saved as text files.

![alt text](image-2.png)

- **Themes** app for chagning wallpaper to a preset image, plain colour, gradient colour OR Import your own bg from computer.

![alt text](image-3.png)

changing the accent colour updates the default 'blue' to your colour system-wide.
- **Paint** for scribbling or any drawing. It supports multi colours.

![alt text](image-4.png)

- **Web Browser** for surfing on the internet (only some sites actually support them running it in as embedded.)

![alt text](image-5.png) ![alt text](image-6.png)

Currently, working example it includes is Wikipedia.
- **Shell** for running multiple commands and controlling the OS!

![alt text](image-7.png)

- **Files** includes multiple folders and you can create and save your text files and open it in here

![alt text](image-8.png)

- **Image Viewer** its not a standalone app, you can view images which are in the wallpaper folder.

![alt text](image-9.png)

- **Store** currently only web browser comes pre installed, others will be coming in an upcming devlog

![alt text](image-10.png)

- **Control Panel** It includes basic settings for quick adjusting.

![alt text](image-11.png)

- **Search Bar** you can search your apps

![alt text](image-12.png)

- **Boot Screen**

![alt text](image-13.png)

- All Windows are resizeable
 
---

# Limitations

- No persistence - Closing or reloading the tab resets everything.
- The browser uses an `<iframe>`, so sites with `X-Frame-Options` (Google, YouTube, GitHub, Reddit) refuse to load. Wikipedia works.
-Paint canvas has a fixed internal resolution so the CSS scales it to fit the window
- Alarms use 'alert()' instead of a custom notification UI.

# RoadMap

- localStorage for all variables
- More apps like VSC, Games, etc (some are listed in store)
- Start menu improvements
- Better file management
- More animations and Fx.
 
# Tech Stack

- HTML
- CSS
- JavaScript