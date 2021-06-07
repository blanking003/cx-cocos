
#import "cxMaskView.h"

#define pop_height 200
#define RGBCOLOR(r,g,b) [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:1]

@implementation CxMaskView


- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    self.userInteractionEnabled = false;
    self.clipsToBounds = true;

    CGSize screen = [[UIScreen mainScreen] bounds].size;
    self.contentView = [[UIView alloc] initWithFrame:CGRectMake(-frame.origin.x, -frame.origin.y, screen.width, screen.height)];
    self.contentView.userInteractionEnabled = false;
    [self addSubview:self.contentView];
    
    return self;
}


@end
