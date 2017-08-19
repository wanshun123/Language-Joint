# Language Joint

This was just a fun project built off https://github.com/szimek/webrtc-translate. A video demonstration of how it works is at https://www.youtube.com/watch?v=fQTPuv_dJaE. You select the language you're interested in learning and it'll pair you with a native speaker of that language who you can then chat to. Anything you write or speak (if you have speech recognition turned on) will be translated into your partners language. Users can also create their own room as in the original project. Chrome only (due to web speech API).

The frontend is similar to the original project with some minor changes, on the backend users are stored in a MySQL database and the table is queried every few seconds to see if there are two users that can be matched. You will want a way of deleting users from the database who close the window while in the waiting room - in my phpMyAdmin on my server I had a query that would delete any user where updated_at < NOW() - interval 5 second.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `GOOGLE_TRANSLATE_API_KEY=XXXXXX ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).
