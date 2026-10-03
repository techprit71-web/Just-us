# Just Us — lightweight mobile chat

This version keeps the private-room flow lightweight for older phones and changes the chat into a full-height, WhatsApp-style conversation screen.

## Included
- Exact normalized room-code joining.
- Full-screen chat interface with header, avatar, message bubbles and composer.
- Profile/settings screen.
- Profile photo upload with local square crop tool.
- Optional chat haptics switch (OFF by default). No haptics are used unless the user turns them on.
- No framework/build step; plain HTML/CSS/JavaScript.

## Important
This frontend expects the same Supabase RPC functions/tables as the previous package:
- create_private_room
- join_private_room
- messages

Do not run supabase.sql on an existing project until the existing schema has been checked. If your existing schema uses different columns/table names, adapt the SQL rather than creating duplicate systems.

## Config
Edit config.js and enter your Supabase project URL and browser-safe publishable/anon key. Never put a Supabase service-role/secret key in this frontend.

## Profile photo
The cropper stores the cropped image locally on that device. This avoids requiring a new database column immediately. To synchronize avatars between both phones, add an avatar URL column/profile table and update the room/member RPC to return it; the existing `avatars` Storage bucket can then be used.
