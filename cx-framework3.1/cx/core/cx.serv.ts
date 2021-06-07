import * as cc from 'cc';
import sys from './cx.sys';

let _commonHeaders: string[];

export default 
{
	//取远程文件并保存到本地localPath，如果是JS，localPath无效
	loadFile (url: string, localPath?: string, callback?: Function)
	{
		if (!sys.os.native || !localPath)
		{
			this.loadAsset(url, callback);
			return;
		}

		if (jsb.fileUtils.isFileExist(localPath))
		{
			this.loadAsset(localPath, callback);
			return;
		}

		this.internalRequest("GET", url, null, (ret: any) =>
		{
			var path = localPath.substr(0, localPath.lastIndexOf("/"));
			if (!jsb.fileUtils.isDirectoryExist(path))
				jsb.fileUtils.createDirectory(path);
			// 3.0和3.1版本的writeDataToFile有bug，报参数错误，因此使用NativeUtils
			// jsb.fileUtils.writeDataToFile(new Uint8Array(ret.data), localPath);
			cxnative.NativeUtils.writeDataToFile(new Uint8Array(ret.data), localPath);
			this.loadAsset(localPath, callback);
		}, undefined, {responseType:'arraybuffer'});
	},

	//取本地或远程资源文件: 图片、mp3、视频等
	loadAsset (url: string, callback?: Function)
	{
		cc.assetManager.loadRemote(url, function(err, asset)
		{
			if (err)
				cc.log("cx.serv.loadAsset error", err);
			else
				callback && callback(asset);
		});
	},

	call (url: string, callback?: Function, context?: any)
	{
		this.internalRequest("GET", url, undefined, callback, context);
	},

	post (url: string, data?: any, callback?: Function, context?: any)
	{
		this.internalRequest("POST", url, data, callback, context);
	},

	upload (url: string, filePath: string, callback?: Function)
	{
		if (sys.os.native)
			this.internalRequest("POST", url, jsb.fileUtils.getValueMapFromFile(filePath), callback, undefined, {headers: ['Content-Type', 'application/octet-stream']});
	},

	setCommonHeaders (headers: string[])
	{
		_commonHeaders = headers;
	},

	internalRequest (method: string, url: string, data?: any, callback?: Function, context?: any, option?: any)
	{
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() 
		{
			if (xhr.readyState === 4 && xhr.status === 200)
				callback && callback({data:xhr.response, context:context});
		};
		if (option)
		{
			if (option.responseType)
			{
				xhr.responseType = option.responseType;
			}
			if (option.headers)
				for (var i=0; i<option.headers.length; i+=2)
					xhr.setRequestHeader(option.headers[i], option.headers[i+1]);
		}
		if (_commonHeaders)
			for (var i=0; i<_commonHeaders.length; i+=2)
				xhr.setRequestHeader(_commonHeaders[i], _commonHeaders[i+1]);
		xhr.open(method, url);
		xhr.send(data);
	}
}
