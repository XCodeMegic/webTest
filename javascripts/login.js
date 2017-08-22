$(function(){
	$('#btn-ok').on('click',function() {
		var time = new Date();
		time = time.getTime();
		var username = $("#username").val();
		var password = $("#userpass").val();
		password = $.md5(password);

		var sign = $.md5(time + password);
		$.ajax({
			type: 'post',
			url: "/login",
			data:{
				'username':username,
				'logindate':time,
				'sign':sign
			},
			dataType: 'json',
			success:function(data) {
				if (data.result == 'OK') {
					$(location).attr('href', '/');
				} else {
					ShowModal('账号密码错误');
				}
			},
			error:function() {
				ShowModal('连接出错');
			}
		});
	});
	$('#sign-box').delegate('input', 'keypress', function(event) {
		if (event.keyCode == 13) {
			$('#btn-ok').trigger('click');
		}
	});
});

function ShowModal(text) {
	$('#modal-text').text(text);
	$('#myModal').on('show.bs.modal', function (e) {  
		$(this).find('.modal-dialog').css({
			'margin-top': function () {
				var modalHeight = $('#myModal').find('.modal-dialog').height();
				return ($(window).height() / 2 - (modalHeight / 2));
			}
		});
	});
	$('#myModal').modal('show');
}
