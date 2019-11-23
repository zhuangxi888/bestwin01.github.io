 Vue.component('pop-box', {
 	props: ['title', 'message'],
 	template: '\
 	    <div class="modal">\
 	        <div class="modal_dialog">\
 	            <div class="modal_content">\
 	                <h3 class="modal_title">{{title}}</h3>\
 	                <div class="rule_text">{{message}}</div>\
 	                <a href="javascript:void(0)" class="modal_close" @click="app.hidePop()">X</a>\
 	            </div>\
 	        </div>\
 	    </div>'
 });

 Vue.component('pop-rank', {
 	props: ['title', 'datafrom'],
 	template: '\
 	    <div class="modal">\
 	        <div class="modal_dialog">\
 	            <div class="modal_content">\
 	               <h3 class="modal_title">{{title.msg}}</h3>\
 	                <table class="rank_table">\
                         	<thead>\
                         		<tr>\
                         			<th>{{title.rank}}</th>\
                         			<th>{{title.achievement}}</th>\
                         			<th>{{title.id}}</th>\
                         		</tr>\
                         	</thead>\
                         	<tbody>\
                         		<tr v-for="(value,index) in datafrom">\
                         			<td>{{value.n}}</td>\
                         			<td>{{value.m | numFilter}}ETH</td>\
                         			<td>{{value.u}}</td>\
                         		</tr>\
                         	</tbody>\
                         </table>\
						<a href="javascript:void(0)" class="modal_close" @click="app.hidePop()">X</a>\
 	            </div>\
 	        </div>\
 	    </div>'
 });

 Vue.filter("numFilter", function(value) {
 	if(isNaN(value)){
 		return "--"
 	}
 	let realVal = parseFloat(value).toFixed(4);
 	return realVal
 });

var compare = function (obj1, obj2) {
    var val1 = obj1.times;
    var val2 = obj2.times;
    if (val1 < val2) {
        return 1;
    } else if (val1 > val2) {
        return -1;
    } else {
        return 0;
    }            
};