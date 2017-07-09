function ajax(option){
			  var type = option.type;
				var url = option.url;
				var asy = option.asy;
				var success = option.success;
				var xhl = null;
				if(window.XMLHttpRequest){
					xhl = new XMLHttpRequest();
				}else{
					xhl = new ActiveXObject("Mcrosoft.XMLHttp");
				}
				
				xhl.open(type,url,asy);
				xhl.send();
				xhl.onreadystatechange = function(){
					if(xhl.readyState == 4){
						if(xhl.status == 200){
//							var body = JSON.parse(xhl.responseText);
							success && success(JSON.parse(xhl.responseText));
							
						}
					}
				}
			
		}