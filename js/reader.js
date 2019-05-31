if (!!window.FileReader) {
	console.log("FileReader supported by your browser!");
	window.reader = new FileReader();

	// 读取开始时触发
	reader.onloadstart = function (e) {
		// console.log("file reader onload start!", e);
	};

	// 读取中
	reader.onprogress = function (e) {
		// console.log("file reader on progress!", e);
	};

	// 中断时触发
	reader.onabort = function (e) {
		console.log("file reader on abort!", e);
	};

	// 出错时触发
	reader.onerror = function (e) {
		console.log("file reader on error!", e);
	};

	// 文件读取成功完成时触发
	reader.onload = function (e) {
		// console.log("file reader on load!", e);
		readerOnload(this.result);
	};

	// 读取完成触发，无论成功或失败
	reader.onloadend = function (e) {
		// console.log("file reader on loadend!", e);
	};
} else {
	console.log("FileReader not supported by your browser!");
}