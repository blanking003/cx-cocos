import * as cc from 'cc';

import native from "./cx.native";
import picker from "./cx.picker";
import res from "./cx.res";
import script from "./cx.script";
import serv from "./cx.serv";
import sys from "./cx.sys";
import ui from "./cx.ui";
import utils from "./cx.utils";

class cx extends ui
{
	static native = native;
	static picker = picker;
	static res = res;
	static script = script;
	static serv = serv;
	static sys = sys;
	static utils = utils;

	static config = sys.config;
	static os = sys.os;
	
	static log = console.log;

	static init(mainScene: cc.Component)
	{
		console.log("..... cx init (framework: " + sys.version + ") .....");

		sys.init();
		ui.init(mainScene);

		if (!sys.config.debug)
			this.log = function(){};

		console.log("..... cx init success (sw:" + ui.sw + ", sh:" + ui.sh + ") .....");
	}
}

window.cx = window.cx || cx;



