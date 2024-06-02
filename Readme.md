# Description

Build a simple cloud application this is similar to Google Drive.

- User should be able to login with email and password
- After logging in, user should be able to see the list of uploaded files and folders in table
  Table format: No, Name, Uploaded At, Action Menu [Delete, Rename, Compress, Download]
- User should be able to see file content (_.txt, _.png) by double clicking the table row
- User should be able to enter the folder's content by double clicking the table row
  Put "Go to parent" row as the first row in the table
- Deleting file (folder) should move it to "Recycle Bin" that has expiration time of 5 mins
  User should be able to recover from the "Recycle Bin" and they will appear in the original directory
  After expiration time, they will be permanently deleted
- User should be able to upload multiple files or folders
- Compressing file (folder) will generate a zip file to the current directory
- User should be able to download file or folder
  As for folders, it will be downloaded in \*.zip file
  (Notes: URL path should reflect the current directory)

## Tech-Stacks

- Vite + Express + React
- MongoDB
- JSZip
- Axios

## Database Design

- Users: Store the user information (email, password)
- Files: Store the file information (name, path, data, removedAt, contentType, username)

## Frontend Pages

- /login: sign page
- /: main page with the file actions
- /recycle: pages with deleted items
- /file/:id: file detail page

## Challenges

Configuring the file structure appropriatly to improve the performance.
This data structure is directly affected to the performance as well as the code quality.
In this app, configured the path appropriately and checked the file/directory structure based on them.

By doing that, made it simple to update the relevant file information.

## Installation

- Clone the repository
- Setup the dependencies

```
npm install
```

- Run MongoDB database
- Run the Dev Machine

```
npm run dev
```
