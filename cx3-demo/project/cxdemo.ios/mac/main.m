#import <Cocoa/Cocoa.h>
#import "AppController.h"

int main(int argc, const char * argv[])
{
    id delegate = [[AppController alloc] init];
    NSApplication.sharedApplication.delegate = delegate;
    return NSApplicationMain(argc, argv);
}
