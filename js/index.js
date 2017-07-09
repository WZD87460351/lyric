window.onload = function(){
			var oul = document.getElementById('ul');
			var osong = document.getElementById('song');
			var obtn = document.getElementById('btn');
			var music = document.getElementById('music');
			obtn.onclick = function(){
				if(osong.value == ''){
					alert('fuck');
					return false;
				}
				
				var song = new Promise(function(res,rej){
					var xhl = null;
					if(window.XMLHttpRequest){
						xhl = new XMLHttpRequest();
					}else{
						xhl = new ActiveXObject("Microsoft.XMLHTTP");
					}
				
					xhl.open('get','https://api.imjad.cn/cloudmusic/?type=search&s='+osong.value,true);
					xhl.send();
					xhl.onreadystatechange = function(){
						if(xhl.readyState == 4){
							if(xhl.status == 200){
								res(xhl.responseText);
							}else{
								rej(xml.status);
							}
						}
					}
				})
				song.then(function(data){
					var data = JSON.parse(data);
					oul.innerHTML = '';
					for(var i = 0;i < data.result.songs.length;i++){
						var LI = document.createElement('li');
						var oimg = document.createElement('img');
						oimg.setAttribute('src',data.result.songs[i].al.picUrl);
						oimg.setAttribute('data-id',data.result.songs[i].id);
						LI.appendChild(oimg);
						oul.appendChild(LI);
					}
				},function(error){
					alert(error);
				});
			}
			
			
			oul.onclick = function(e){
				var eve = e || window.event;
				var target = eve.srcElement || eve.target;
				if(target.nodeName.toLowerCase() == 'img'){
					var Play = new Promise(function(resolve,reject){
						var xhl = null;
						if(window.XMLHttpRequest){
							xhl = new XMLHttpRequest();
						}else{
							xhl = new ActiveXObject("Microsoft.XMLHTTP");
						}

						xhl.open('get','https://api.imjad.cn/cloudmusic/?type=song&id='+target.getAttribute('data-id'),true);
						xhl.send();
						xhl.onreadystatechange = function(){
							if(xhl.readyState == 4){
								if(xhl.status == 200){
									resolve(xhl.responseText);
								}else{
									reject(xml.status);
								}
							}
						}
					})
					
					Play.then(function(data){
						var data = JSON.parse(data);
						music.setAttribute('src',data.data[0].url);
						
						//get lyric start
						var songly = new Promise(function(resolve,reject){
							var xhl = null;
							if(window.XMLHttpRequest){
								xhl = new XMLHttpRequest();
							}else{
								xhl = new ActiveXObject("Microsoft.XMLHTTP");
							}
							
							xhl.open('get','https://api.imjad.cn/cloudmusic/?type=lyric&id='+target.getAttribute('data-id'),true);
							xhl.send();
							xhl.onreadystatechange = function(){
								if(xhl.readyState == 4){
									if(xhl.status == 200){
										resolve(xhl.responseText);
									}else{
										reject(xml.status);
									}
								}
							}
						})
						
						songly.then(function(data){
							var data = JSON.parse(data);
							var lyric = JSON.stringify(data.lrc.lyric);
							
							var arr_lyric = [];
							var reg = /\[\d{2}:\d{2}.\d{1,3}\]/g;
							var reg2 = /\[\d{2}:\d{2}.\d{1,3}\]/g;
							var arr_lyric = lyric.slice(1,-1);

							var arr_lyric = arr_lyric.split(/\\n/g);
							var arr_lyric_time = [];
							var arr_lyric_body = [];
							for(var i=0;i<arr_lyric.length-1;i++){
								// console.log(arr_lyric[i]);
								arr_lyric_time.push(arr_lyric[i].match(reg));

								arr_lyric_body.push(arr_lyric[i].replace(reg2, ''));
							}
							var mins_reg = /\d{2}:/g;
							var change_time =[];
							arr_lyric_time.forEach(function(arr, index) {
								var arr2;
								if(arr != null){
									arr2 = arr.toString();
								}else{
									arr2 = '[00:00.00]';
								}

								var t = arr2.slice(1, -1).split(':');

								arr_lyric.push([parseInt(t[0], 10) * 60 +parseFloat(t[1]),arr_lyric_body[index]])
							});
							
							music.ontimeupdate = function(){
								for(var i=0;i<arr_lyric.length;i++){
									if(this.currentTime >= arr_lyric[i][0]){
										lyricContainer.innerHTML = '';
										var li = document.createElement('li');
										li.innerText = arr_lyric[i][1];
										lyricContainer.appendChild(li)
									}
								}
								if(this.ended){
									lyricContainer.innerHTML = '';
								}
							}

						},function(error){
							alert('error');
						});
						//get lyric end
						
					},function(error){
						alert('error');
					});
					
				}	
			}
			
			function parseLyric(text) {
		    //将文本分隔成一行一行，存入数组
		    var lines = text.split('\n'),
		        //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
		        pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
		        //保存最终结果的数组
		        result = [];
		    //去掉不含时间的行
		    while (!pattern.test(lines[0])) {
		        lines = lines.slice(1);
		    };
		    //上面用'\n'生成生成数组时，结果中最后一个为空元素，这里将去掉
		    lines[lines.length - 1].length === 0 && lines.pop();
		    lines.forEach(function(v /*数组元素值*/ , i /*元素索引*/ , a /*数组本身*/ ) {
		        //提取出时间[xx:xx.xx]
		        var time = v.match(pattern),
		            //提取歌词
		            value = v.replace(pattern, '');
		        //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
		        time.forEach(function(v1, i1, a1) {
		            //去掉时间里的中括号得到xx:xx.xx
		            var t = v1.slice(1, -1).split(':');
		            //将结果压入最终数组
		            result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
		        });
		    });
		    //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
		    result.sort(function(a, b) {
		        return a[0] - b[0];
		    });
		    return result;
			}
			
		}