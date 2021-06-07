
//ex: node update.js -v 20210520

var remote_url = 'http://192.168.50.5:8080/cx-web/cx3-demo-update/';  //远程更新地址

var dest = './boot/';
var src = './assets';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var manifest =
{
	packageUrl: remote_url + "assets/",                  //更新资源包所在目录
	remoteManifestUrl: remote_url + 'project.manifest',  //资源版本描述文件地址
	remoteVersionUrl: remote_url + 'version.manifest',   //版本描述文件地址
	version: '1.0',
	assets: {},
	searchPaths: []
};

var i = 2;
while(i < process.argv.length)
{
	var arg = process.argv[i];

	switch(arg)
	{
		case '--url':
		case '-u':
			var url = process.argv[i + 1];
			manifest.packageUrl = url;
			manifest.remoteManifestUrl = url + 'project.manifest';
			manifest.remoteVersionUrl = url + 'version.manifest';
			i += 2;
			break;
		case '--version':
		case '-v':
			manifest.version = process.argv[i + 1];
			i += 2;
			break;
		case '--src':
		case '-s':
			src = process.argv[i + 1];
			i += 2;
			break;
		case '--dest':
		case '-d':
			dest = process.argv[i + 1];
			i += 2;
			break;
		default:
			i++;
			break;
	}
}


function readDir (dir, obj)
{
	var stat = fs.statSync(dir);
	if(!stat.isDirectory())
	{
		return;
	}
	var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
	for(var i = 0; i < subpaths.length; ++i)
	{
		if(subpaths[i][0] === '.')
		{
			continue;
		}
		subpath = path.join(dir, subpaths[i]);
		stat = fs.statSync(subpath);
		if(stat.isDirectory())
		{
			readDir(subpath, obj);
		}
		else if(stat.isFile())
		{
			// Size in Bytes
			size = stat['size'];
			md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
			compressed = path.extname(subpath).toLowerCase() === '.zip';

			relative = path.relative(src, subpath);
			relative = relative.replace(/\\/g, '/');
			relative = encodeURI(relative);
			obj[relative] = {
				'size': size,
				'md5': md5
			};
			if(compressed)
			{
				obj[relative].compressed = true;
			}
		}
	}
}

// function readFile (dir, file, obj)
// {
// 	var stat = fs.statSync(dir + file);
// 	if (!stat.isFile())
// 	{
// 		return;
// 	}
// 	var size, md5, compressed, relative;
// 	size = stat['size'];
// 	md5 = crypto.createHash('md5').update(fs.readFileSync(dir + file)).digest('hex');
// 	compressed = path.extname(file).toLowerCase() === '.zip';

// 	relative = path.relative(src, dir + file);
// 	relative = relative.replace(/\\/g, '/');
// 	relative = encodeURI(relative);
// 	obj[relative] = {
// 		'size': size,
// 		'md5': md5
// 	};
// 	if(compressed)
// 	{
// 		obj[relative].compressed = true;
// 	}
// }

var mkdirSync = function(path)
{
	try
	{
		fs.mkdirSync(path);
	} catch(e)
	{
		if(e.code != 'EEXIST') throw e;
	}
}

// Iterate assets and src folder
//readFile(src, 'settings.json', manifest.assets);
// readDir(path.join(src, 'assets'), manifest.assets);
readDir(src, manifest.assets);

var destManifest = path.join(dest, 'project.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) =>
{
	if (err) throw err;
	console.log('Manifest successfully generated');
});

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) =>
{
	if (err) throw err;
	console.log('Version successfully generated');
});
