(function ( window, $ ) {

    Fancy.require( {
        jQuery: false,
        Fancy : "1.0.2"
    } );

    var NAME    = "FancySwipe",
        VERSION = "1.0.4",
        logged  = false;

    function getType( e ) {
        var t = e.originalEvent.touches,
            r = e.originalEvent.changedTouches;
        t     = t ? t [ 0 ] : false;
        r     = r ? r [ 0 ] : false;
        if ( t ) {
            return {
                x: t.clientX,
                y: t.clientY
            };
        } else if ( r ) {
            return {
                x: r.clientX,
                y: r.clientY
            };
        } else {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }

    }

    function checkTouches( event ) {
        if ( event.originalEvent.touches ) {
            return event.originalEvent.touches.length == 1;
        }
        return true;
    }

    function preventSelect( e ) {
        e.attr( "unselectable", "on" ).css( "user-select", "none" ).on( "selectstart", false );
    }

    function enableSelect( e ) {
        e.removeAttr( "unselectable" ).css( "user-select", "" ).unbind( "selectstart" );
    }

    function FancySwipe( element, settings ) {
        var SELF      = this;
        SELF.name     = NAME;
        SELF.version  = VERSION;
        SELF.element  = element;
        SELF.settings = $.extend( {}, Fancy.settings [ NAME ], settings );

        if ( !logged ) {
            logged = true;
            Fancy.version( SELF );
        }
        SELF.element.on( "mousedown." + NAME + " touchstart." + NAME, function ( event ) {
            var startX = getType( event ).x,
                dir    = '',
                startY = getType( event ).y,
                marginX,
                marginY;
            preventSelect( $( document ) );
            SELF.settings.onMouseDown.call( SELF.element, startX, startX );
            $( document ).off( "." + NAME ).on( 'mousemove.' + NAME + ' touchmove.' + NAME, function ( e ) {
                if ( checkTouches( event ) ) {
                    var x = getType( e ).x,
                        y = getType( e ).y;
                    if ( x > startX ) {
                        // moving right
                        marginX = x - startX;
                        if ( marginX > SELF.settings.min ) {
                            dir = 'right';
                        }
                    } else if ( x < startX ) {
                        // moving left
                        marginX = startX - x;
                        if ( marginX > SELF.settings.min ) {
                            dir = 'left';
                        }
                    }
                    if ( y > startY ) {
                        // moving down
                        marginY = y - startY;
                        if ( marginY > SELF.settings.min ) {
                            dir = ( dir && dir != 'down' ? dir + ' ' : '' ) + 'down';
                        }
                    } else if ( y < startY ) {
                        // moving up
                        marginY = startY - y;
                        if ( marginY > SELF.settings.min ) {
                            dir = ( dir && dir != 'up' ? dir + ' ' : '' ) + 'up';
                        }
                    }
                    SELF.settings.onMouseMove.call( SELF.element, e, dir, marginX, marginY );
                }
            } ).on( 'mouseup.' + NAME + ' touchend.' + NAME, function ( e ) {
                enableSelect( $( document ).unbind( '.' + NAME ) );
                if ( marginX > SELF.settings.min && ( SELF.settings.max ? marginX < SELF.settings.max : true ) ) {
                    SELF.settings.onMouseUp.call( SELF.element, e, dir, marginX, marginY );
                } else if ( marginY > SELF.settings.min && ( SELF.settings.max ? marginY < SELF.settings.max : true ) ) {
                    SELF.settings.onMouseUp.call( SELF.element, e, dir, marginX, marginY );
                }
            } );
        } ).on( "remove." + NAME, function () {
            enableSelect( $( document ).unbind( "." + NAME ) );
        } );
        SELF.element.data( NAME, SELF );
        return SELF;
    }


    FancySwipe.api = FancySwipe.prototype = {};
    FancySwipe.api.version = VERSION;
    FancySwipe.api.name    = NAME;
    FancySwipe.api.destroy = function () {
        $( document ).on( "." + NAME );
        this.element.off( "." + NAME ).removeData( NAME );
    };

    Fancy.settings [ NAME ] = {
        min        : false,
        max        : false,
        onMouseUp  : function () {},
        onMouseMove: function () {},
        onMouseDown: function () {}

    };

    Fancy.swipe     = true;
    Fancy.api.swipe = function ( settings ) {
        return this.set( NAME, function ( el ) {
            return new FancySwipe( el, settings );
        } );
    };
})( window, jQuery );
