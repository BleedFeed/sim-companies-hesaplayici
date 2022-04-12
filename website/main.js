$('.item').click(async function () 
{
	$(this).addClass('selected').siblings().removeClass('selected');
	let itemInfo = await fetch(`/resources/${$(this).attr('id')}`); 
	itemInfo = await itemInfo.json();
	console.log(itemInfo);
	
});
