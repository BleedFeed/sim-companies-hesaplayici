$("#itemler label").click(function () {
  $(this).addClass("selected").siblings().removeClass("selected");
});
