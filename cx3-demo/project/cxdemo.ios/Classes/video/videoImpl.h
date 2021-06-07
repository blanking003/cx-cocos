

#import <UIKit/UIKit.h>

@interface VideoView : UIView

-(void) setPosition:(float)left top:(float)top;
-(void) play:(NSString*)url listenProgress:(bool)listenProgress;
-(void) pause;
-(void) resume;
-(void) close;
-(void) setFullScreen:(bool)value;
-(void) seekToTime:(int)seconds;
-(void) showBar:(bool)value;
-(void) lockSeek:(bool)value;

@end

