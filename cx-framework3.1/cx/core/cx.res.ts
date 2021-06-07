import * as cc from 'cc';
import serv from './cx.serv';

export default 
{
	//从resources目录取图片
	//sizeMode: 
	//	cc.Sprite.SizeMode.CUSTOM - 图片适应Node尺寸
	//	cc.Sprite.SizeMode.TRIMMED - 图片裁剪后的尺寸
	//	cc.Sprite.SizeMode.RAW - 图片原始尺寸
	setImageFromRes (spriteOrNode: any, img: string, sizeMode?: number, callback?: Function)
	{
		var sprite: cc.Sprite = spriteOrNode instanceof cc.Sprite ? spriteOrNode : (spriteOrNode.getComponent(cc.Sprite) || spriteOrNode.addComponent(cc.Sprite));
		cc.resources.load(img, (err: Error | null, asset: cc.ImageAsset) =>
		{
			if (err)
				cc.log("cx.serv.setImageFromRes error", err);
			else
			{
				sprite.sizeMode = sizeMode != null ? sizeMode : cc.Sprite.SizeMode.CUSTOM;
				var spriteFrame = new cc.SpriteFrame();
				spriteFrame.texture = asset._texture;
				sprite.spriteFrame = spriteFrame;
				callback && callback(sprite);
			}
		});
	},

	//从bundle目录取图片
	setImageFromBundle (spriteOrNode: cc.Sprite | cc.Node, path: string, sizeMode?: number, callback?:Function)
	{
		var sprite: cc.Sprite = spriteOrNode instanceof cc.Sprite ? spriteOrNode : (spriteOrNode.getComponent(cc.Sprite) || spriteOrNode.addComponent(cc.Sprite));
		this.loadBundleRes(path, (asset: cc.ImageAsset) =>
		{
			sprite.sizeMode = sizeMode ? sizeMode : cc.Sprite.SizeMode.CUSTOM;
			var spriteFrame = new cc.SpriteFrame();
			spriteFrame.texture = asset._texture;
			sprite.spriteFrame = spriteFrame;
			callback && callback(sprite);
		});
	},

	//从远程取图片, localPath: 保存到本地路径，并优先从该路径取图片
	setImageFromRemote (spriteOrNode: cc.Sprite | cc.Node, url: string, localPath?: string, sizeMode?: number, callback?:Function)
	{
		serv.loadFile(url, localPath, function(asset: cc.ImageAsset)
		{
			var sprite: cc.Sprite = spriteOrNode instanceof cc.Sprite ? spriteOrNode : (spriteOrNode.getComponent(cc.Sprite) || spriteOrNode.addComponent(cc.Sprite));
			sprite.sizeMode = sizeMode != null ? sizeMode : cc.Sprite.SizeMode.CUSTOM;
			var spriteFrame = new cc.SpriteFrame();
			spriteFrame.texture = asset._texture;
			sprite.spriteFrame = spriteFrame;
			callback && callback(sprite);
		});
	},

	//加载prefab，callback(类对象)
	//ex: ("page/page1", this.xx.bind(this))
	//ex: (["page/page1", "page/page2"], this.xx.bind(this))
	//ex: ({p1:"page/page1", p2:"page/page2"}, this.xx.bind(this))
	loadBundleRes (prefab: string | string[], callback?:Function)
	{
		var load = function(fab: string, index?: number)
		{
			var p = fab.indexOf("/");                      //prefab = ui/path1/page1
			var ui = p ? fab.substr(0, p) : "ui";          //ui = ui
			var res = p ? fab.substr(p + 1) : fab;         //res = path1/page1
			cc.assetManager.loadBundle(ui, (err, bundle) => 
			{
				bundle.load(res, (err, asset) =>
				{
					if (err)
						cc.log("cx.serv.loadBundleRes error", err);
					else if (index == undefined)
						callback && callback(asset);
					else
					{
						assets[index] = asset;
						if (++loadedCount == assets.length)
							callback && callback(assets.length == 1 ? assets[0] : assets);
					}
				});
			});
		};
		if (typeof prefab === "string")
			load(prefab);
		else
		{
			var assets = new Array(prefab.length);
			var loadedCount = 0;
			for (var i in prefab)
				load(prefab[i], +i);
		}
	}
}