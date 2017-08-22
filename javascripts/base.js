$(function(){
	$('#search').delegate('li > a','click', function() {
		$('#search > li').removeClass('active');
		$(this).parent().addClass('active');
		$('#search-caption').text($(this).text());
		var crash_type = $(this).data('id');
		show_info(0, parseInt(crash_type));
	});

	$('#crash-info').delegate('tbody > tr', 'click', show_details);

	$('#page-next').on('click', function() {
		var crash_type = $('#page-index').attr('data-type');
		var index = parseInt($('#page-index').attr('data-index'));
		var count = parseInt($('#page-index').attr('data-count'));
		if (crash_type && index < count) {
			show_info(index, crash_type);
		}
	});

	$('#page-last').on('click', function() {
		var crash_type = $('#page-index').attr('data-type');
		var index = parseInt($('#page-index').attr('data-index'));
		var count = parseInt($('#page-index').attr('data-count'));
		if (crash_type && index < count) {
			show_info(count - 1, crash_type);
		}
	});

	$('#page-prev').on('click', function() {
		var crash_type = $('#page-index').attr('data-type');
		var index = parseInt($('#page-index').attr('data-index'));
		var count = parseInt($('#page-index').attr('data-count'));
		if (crash_type && index > 1) {
			show_info(index - 2, crash_type);
		}
	});

	$('#page-first').on('click', function() {
		var crash_type = $('#page-index').attr('data-type');
		var index = parseInt($('#page-index').attr('data-index'));
		var count = parseInt($('#page-index').attr('data-count'));
		if (crash_type && index > 1) {
			show_info(0, crash_type);
		}
	});

	$('#btn-delete').on('click', delete_info);

	$('#search > li:first-child > a').trigger('click');
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

function show_info(index, crash_type) {
	$.ajax({
		type:'post',
		url:'/query/info_count',
		data:{'search_type':crash_type},
		dataType:'json',
		success : function(data) {
			var page_index = index + 1;
			var page_count = Math.ceil(data.count/10);
			if (page_count == 0) {
				page_index = 0;
			}
			$('#page-index > a').html(page_index + '/' + page_count);
			$('#page-index').attr({
				'data-index':page_index,
				'data-count':page_count,
				'data-type':crash_type
			});

			if (page_index > 1) {
				$('#page-prev').removeClass('disabled');
				$('#page-first').removeClass('disabled');
			} else {
				$('#page-prev').addClass('disabled');
				$('#page-first').addClass('disabled');
			}
			if (page_count > page_index) {
				$('#page-next').removeClass('disabled');
				$('#page-last').removeClass('disabled');
			} else {
				$('#page-next').addClass('disabled');
				$('#page-last').addClass('disabled');
			}
		},
		error : function() {
			ShowModal('获取信息长度出错');
		}
	});
	$.ajax({
		type:'post',
		url:'/query/info',
		data:{
			'search_type':crash_type,
			'pageno':index
		},
		dataType:'json',
		success : function(data) {
			$('#crash-info > tbody').empty();
			var crashes = data;
			for (var i = 0; i < crashes.length; i++) {
				var crash = crashes[i];
				var doc = '<tr class="auto-hiden" data-id="' + crash.id + '"><td>' + crash.crash_type.replace(/-crash/,"") + '</td>';
				doc += /*'<td class="auto-hiden">' + crash.app_ver + '</td>' +*/
						'<td class="auto-hiden">' + crash.crash_date + '</td></tr>';
				$('#crash-info > tbody').append(doc);
			}
		},
		error : function() {
			ShowModal('获取信息出错');
		}
	});
}

function show_details() {
	$("#crash-info > tbody > tr").removeClass('active');
	$(this).addClass('active');
	var id = $(this).data('id');
	$.ajax({
		type:'post',
		url:'/query/detail',
		data:{'crash_id':id},
		dataType:'json',
		success:function(data) {
			$('#crash-detail > tbody').empty();
			for (var x in data) {
				if (x == 'id') {
					$('#crash-detail').attr('data-id', data[x]);
					continue;
				}
				var doc = '<tr><td>' + x + '</td><td>' + data[x] + '</td></tr>';
				if (x == 'stack_trace') {
					doc = '<tr><td>' + x + '</td><td><pre>' + data[x] + '</pre></td></tr>';
				}
				$('#crash-detail > tbody').append(doc);
			}
		},
		error:function() {
			ShowModal('获取详细信息出错');
		}
	});
}

function delete_info() {
	var id = $('#crash-detail').attr('data-id');
	if (id == null || id == '') {
		return;
	}
	$.ajax({
		type: 'post',
		url: '/query/delete',
		data:{'crash_id':id},
		dataType:'json',
		success : function(data) {
			$('#crash-detail').attr('data-id','');
			$('#crash-detail > tbody').empty();
			var index = parseInt($('#page-index').attr('data-index'));
			var crash_type = $('#page-prev').attr('data-type');
			if($('#crash-info > tbody').children().length > 1) {
				index -= 1;
			} else {
				if (index > 1) {
					index -= 2;
				} else {
					index = 0;
				}
			}
			show_info(index, crash_type);
		},
		error : function() {
			ShowModal('删除信息出错');
		}
	});
}