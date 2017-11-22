# Router unplug
##### *Note: remember to run with sudo*
## Get Requests
#### /unplug/banned
Will return the list of banned websites with their respective list of IPs.

#### /unplug/willdie
Will return the time left to live in milliseconds.

#### /unplug
Will immediately unplug the router.

## Post Requests
Post requests can be done in different ways, the simplest one is thought the command line using curl. </br>
**Example:**</br>
curl -X POST -d 'variable=Value' 'http://localhost:3000/'
#### time
Making a Post request with the tag time will asign the number of milliseconds for the router to unplug. This action cannot be undone and the router will unplug once the milliseconds expire.</br>
**Example:**</br>
curl -X POST -d 'time=5000' 'http://localhost:3000/unplug'
#### newBannedURL
Making a Post request with the tag newBannedURL allows the user to watch the network traffic for specific urls. Once the website in the list is visited, the router will immediately unplug.  
</br>**Example:**</br>
curl -X POST -d 'newBannedURL=google.com' 'http://localhost:3000/unplug'
If you want to watch multiple urls, you can simply make multiple post requests with the different urls.
</br>**Example:**</br>
curl -X POST -d 'newBannedURL=google.com' 'http://localhost:3000/unplug'
curl -X POST -d 'newBannedURL=yahoo.com' 'http://localhost:3000/unplug'
curl -X POST -d 'newBannedURL=bing.com' 'http://localhost:3000/unplug'
