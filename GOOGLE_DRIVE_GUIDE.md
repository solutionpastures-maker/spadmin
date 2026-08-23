# Google Drive Link Configuration Guide

## How to Configure Google Drive Files for the App

### Step-by-Step Instructions

1. **Upload Your Audio File to Google Drive**
   - Upload the MP3/audio file to your Google Drive
   - Note the file location

2. **Set Sharing Permissions** (CRITICAL)
   - Right-click on the file → **Share**
   - Click the dropdown that says **"Restricted"**
   - Select **"Anyone with the link"**
   - Make sure the role is set to **"Viewer"** (read-only)
   - Click **"Done"**

3. **Copy the Share Link**
   - Right-click the file → **Get link** or **Share**
   - Copy the link (it will look like one of these):
     ```
     https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     ```
     or
     ```
     https://drive.google.com/open?id=FILE_ID
     ```

4. **Paste in Admin Tool**
   - When creating an episode, paste this link in the "Google Drive URL" field
   - The app will automatically extract the file ID

## Required Settings Summary

✅ **File must be set to "Anyone with the link"**  
✅ **Role must be "Viewer" (read-only)**  
✅ **Link must be copied correctly**  

## Testing Your Link

Before adding to an episode, test the link:

1. **Open in Incognito/Private Browser**:
   - Paste the link in a private/incognito window
   - You should be able to access it without signing in
   - If it asks for permission, sharing isn't set correctly

2. **Test Direct Download**:
   - Extract the file ID from your link
   - Try: `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`
   - This should download/stream the file

## Common Issues

### ❌ "Access Denied" Error
**Problem**: File is not set to "Anyone with the link"  
**Solution**: 
- Go back to file → Share → Change to "Anyone with the link"
- Make sure role is "Viewer"

### ❌ "Permission Required" Error
**Problem**: File is still restricted  
**Solution**:
- Double-check sharing settings
- Try copying the share link again after changing settings

### ❌ File Won't Stream
**Problem**: Large file or network issue  
**Solution**:
- Split large files into smaller parts (app supports this)
- Use the direct download format
- Consider using Firebase/Supabase Storage for better performance

## Best Practices

1. **Create a Dedicated Folder**:
   - Create a "Sermon Audio" folder in Google Drive
   - Set the entire folder to "Anyone with the link"
   - Upload all audio files there
   - Easier to manage permissions

2. **File Organization**:
   - Name files clearly: `SeriesName_Episode01_Part1.mp3`
   - Keep original files in a private backup folder
   - Share copies from the public folder

3. **File Size**:
   - Keep individual parts under 100MB for best performance
   - Split long sermons into multiple parts
   - The app supports multiple parts per episode

## Alternative: Use Supabase Storage

If Google Drive becomes problematic:
- Upload files directly to Supabase Storage
- Better control and performance
- No sharing permission issues
- Already configured in your admin tool

## Quick Checklist

Before adding a Drive link:
- [ ] File uploaded to Google Drive
- [ ] File set to "Anyone with the link"
- [ ] Role is "Viewer" (read-only)
- [ ] Share link copied
- [ ] Link tested in incognito browser
- [ ] File ID can be extracted (admin tool will do this automatically)

