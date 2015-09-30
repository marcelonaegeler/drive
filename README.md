# drive
An application to store user files (like Google Drive).
I'm developing this application mostly for study and test myself.

## How to run

0. Clone the source and got to "drive-node":
        
        git clone https://github.com/marcelonaegeler/drive-node.git && cd drive-node

0. Install node modules:
        
        npm install

0. Install bower modules:
        
        bower install

0. Run it:
        
        node app.js


## To do
* Use React.js to view rendering;
* Recursive finder (to tree view);
* ~~Recursive remove~~ (problems with orphan children);
* ~~Breadcrumb links~~;
* Upload file and see how to store the data (the folders will really exist in the hard drive and the files will be organized inside?);
* Test it.


## Resolving problem with MongoDB's module not found

0. Copy the bson.js files

    cp node_modules/monk/node_modules/mongodb/node_modules/bson/browser_build/bson.js node_modules/monk/node_modules/mongodb/node_modules/bson/build/Release/

0. Restart your application and it's done!
