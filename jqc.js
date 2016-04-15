(function (window,undefined){

var arr = [],
	core_push = arr.push,
	core_slice = arr.slice,
	core_indexOf = arr.indexOf,
	core_concat = arr.concat;



//实现构造函数
var jqc = function jqc(selector){
	//返回init构造函数所创建的对象
	return new jqc.prototype.init(selector);
}
//设置原型以及原型别名为fn
jqc.fn = jqc.prototype = {
	constructor:jqc,
	length:0,
	//初始化方法
	init:function ( selector , context ){
		var context = context || document;
		//判断传入的是否是 null '' undefined 0
		if (!selector) return;
		//判断selector是否是字符串
		if (jqc.isString(selector)) {
			if (selector.charAt(0) === "<") {
				//当为html标签时将调用parseHTML方法获取dom数组
				//将获取到的数组调用pushArr方法添加到自身
				this.push( parseHTML(selector) );
			}else{
				//否则调用select方法获取dom数组
				//将获取到的数组调用pushArr方法添加到自身
				this.push( select(selector,context) );
			}
		//判断selector是否是dom节点
		} else if(jqc.isDom(selector)) {
			//当传入的是dom元素时将dom元素添加到自身
			this.push( [selector] );
		//判断传入的是否是dom数组
		} else if(jqc.isLikeArr(selector) && jqc.isDom(selector[0]) ){
			this.push(selector);
		//判断传入的是否是jqc对象
		} else if( jqc.isJqc(selector) ){
			return this;
		}
	},
	push:function (arr){
		return 	jqc.push.apply(this,arr);
	},
	each:function(fn){
		return jqc.each(this,fn);;
	}

}

jqc.fn.init.prototype = jqc.fn;

//实现继承方法
jqc.fn.extend = jqc.extend = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
}

//工具类方法模块
jqc.extend({
	//将arr数组对象添加到obj对象中，要求obj以及arr为数组或者伪数组对象
	push:core_push,
	//循环遍历方法
	each:function (arr,fn){
		for (var i = 0; i < arr.length; i++) {
			//函数返回值为false时停止循环
			if(fn.call(arr[i],i,arr[i]) === false){
				break;
			}
		}
		return arr;
	}
});


//判断类型模块
jqc.extend({
	//判断是否是数组或者伪数组
	isLikeArr:function(obj){
										//如果obj.length > 0 判断最后一位在不在obj内 否则判断length是否为0
		return !!(obj && obj.length && (obj.length > 0 ? obj.length - 1 in obj : obj.length == 0) );
	},
	isString:function(obj){
		return !!(typeof obj === "string");
	},
	isFunc:function(obj){
		return !!(typeof obj === "function");
	},
	//是否是dom对象
	isDom:function(obj){
		return !!(obj.nodeType);
	},
	//是否是jqc对象
	isJqc:function(obj){
		if(obj.constructor.name){
			return !!(obj.constructor.name === "jqc");
		}else{
			return !!(/function\s+(\w+)\s*\(/.exec(obj.constructor+"")[1] === "jqc");
		}
	}
});


//dom操作方法
jqc.fn.extend({
	//将this当子元素添加到传入对象上
	appendTo:function(selector){
		var i = 0,context = jqc(selector),arr = [],
			j,node;
		for (; i < context.length; i++) {
			for ( j = 0; j < this.length; j++) {
				//如果外循环不是最后一次循环则将节点深克隆一份
				node = i < context.length - 1 ? this[j].cloneNode(true) : this[j];
				// 将节点保存在arr中
				arr.push( node );
				// 将节点当子元素添加到上下文节点中
				context[i].appendChild( node );
			}
		}
		//将所有子节点保存在数组中以jqc对象返回
		return jqc(arr);
	},
	//将传入对象转换成jqc当子元素添加到this对象上
	append:function(selector){
		jqc(selector).appendTo(this);
		return this;
	},
	//删除当前jqc对象中的所有dom元素
	remove:function(){
		var arr = [];
		this.each(function(){
			arr.push( this.parentNode.removeChild( this ) );
		})
		//返回删除的jqc对象
		return jqc(arr);
	}
})


//html转换dom对象
var parseHTML = function(html){
	var i = 0,
		arr = [],
		div = document.createElement("div");
	div.innerHTML = html;
	for(; i < div.childNodes.length; i++ ){
		arr.push(div.childNodes[i]);
	}
	return arr;
}

//搜索引擎select
var select = (function(){
	var rQuitCheck = /^(?:#(\w+)|\.(\w+)|(\w+)|(\*))$/;
	var support = {};

	//测试getElementsByClassName方法是否能用
	support.getElementsByClassName = assert(function(div){
		div.innerHTML = "<div class='a'></div>";
		return div.getElementsByClassName("a")[0];
	});
	//能力测试方法
	function assert(fn){
		// 创建测试用节点
		var div = document.createElement("div");
		try {
			// 转换fn的返回值为boolean值
			// fn(div) -- assert(function(div){}) 这里的 div 就是上面创建的测试节点
			return !!fn(div);
		} catch (e) {
			return false;
			// 结束时移除这个节点
		} finally {
			// Remove from its parent by default
			if (div.parentNode) {
				div.parentNode.removeChild(div);
			}
			// release memory in IE
			// 在 IE 里释放内存
			div = null;
		}
	}
	function select ( selector, context, results ){
		var results = results || [];
		//如果上下文对象不存在则初始化为document
		var context = context || document;
		//处理逗号
		var newSelector = selector.split(",");
		jqc.each(newSelector , function(){
			var c = context;
			jqc.each(this.split(" "),function (){
				if (this !== "") c = get(this,c);
			})
			results.push.apply(results,c);
		});
		return results;
	}

	//获取节点方法
	function get( selector, context, results ){
		var results = results || [];
		//如果上下文对象不存在则初始化为document
		var context = context || document;
		//匹配selector
		var m = rQuitCheck.exec(selector);
		if(!m) return;
		//如果context不是数组则变成成数组对象
		if(context.nodeType) context = [ context ];
		if(typeof context === "string") context = get(context);
		jqc.each(context,function(i,v){
			if (m[1]) {
				//匹配到id则调用id方法获得对象数组
				results = getId(m[1], v,results);
			}else if(m[2]){
				//匹配到className
				results = getClassName(m[2], v,results);
			}else{
				//匹配到tag或者*
				results = getTagName( m[3] || m[4], v, results);
			}
		});
		return results;
	}
	//根据id获取节点
	function getId( id, context, results ){
		var results = results || [],
			node;
		node = document.getElementById(id);
		if (node) {
			results.push.call(results,node);
		}
		return results; 
	}
	//根据tag获取节点
	function getTagName( tagName, context, results ){
		var results = results || [],
			node;
		node = document.getElementsByTagName(tagName);
		if (node) {
			results.push.apply(results,node);
		}
		return results; 
	}
	//根据class获取节点
	function getClassName( className, context, results ){
		var results = results || [],
			node;
		if (support.getElementsByClassName) {
			//getElementsByClassName方法是能用则直接使用
			node = document.getElementsByClassName(className);
			if (node) {
				results.push.apply(results,node);
			}
		}else {
			//否则获取全部标签并判断className是否相同
			jqc.each(context.getElementsByTagName("*"),function(){
				if ( (" "+ this.className +" ").indexOf(" "+ className +" ")  != -1 ) {
					//判断是否该标签是否存在className  存在则添加至results
					results.push(this);
				}
			});
		}
		return results;
	}
	//去除首位空格
	function trim (str){
		if ( String.prototype.trim ) {
			return str.trim();
		}else {
			return str.replace(/^\s+|\s+$/g,"");
		}
	}
	return select;
})();

window.jqc = jqc;
})(window);