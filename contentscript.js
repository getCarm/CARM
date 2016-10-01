/*document.body.innerHTML = document.body.innerHTML.replace(new RegExp("Nishank", "g"), "-N");*/


jQuery.fn.textWalk = function( fn ) {
    this.contents().each( jwalk );

    function jwalk() {
        var nn = this.nodeName.toLowerCase();
        if( nn === '#text') {
            fn.call( this );
        } else if( this.nodeType === 1 && this.childNodes && this.childNodes[0] && nn !== 'script' && nn !== 'textarea' ) {
            $(this).contents().each( jwalk );
        }
    }
    return this;
};

$('body').textWalk(function() {
    this.data = this.data.replace('Nishank Kuppa', '-N');
    this.data = this.data.replace('Nishank', '-N');
    this.data = this.data.replace('n', 'N');
});