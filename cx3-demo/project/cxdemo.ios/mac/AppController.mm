#import "AppController.h"
#import "Game.h"
#include <string>

@interface AppController ()
{
    NSWindow* _window;
    Game* _game;
}

@end

@implementation AppController

static AppController* s_sharedAppController;
+ (AppController*)ins
{
    return s_sharedAppController;
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification
{
    s_sharedAppController = self;
    
//     NSRect rect = NSMakeRect(200, 200, 390, 844); //iphone12 pro
    NSRect rect = NSMakeRect(200, 200, 375, 667); //iphone6s
    _window = [[NSWindow alloc] initWithContentRect:rect
                                          styleMask:NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskResizable
                                            backing:NSBackingStoreBuffered
                                              defer:NO];
    if (!_window) {
        NSLog(@"Failed to allocated the window.");
        return;
    }
    
    _window.title = @"";
    
    self.viewController = [[ViewController alloc] initWithSize: rect];
    _window.contentViewController = self.viewController;
    _window.contentView = self.viewController.view;
    [_window.contentView setWantsBestResolutionOpenGLSurface:YES];
    [_window makeKeyAndOrderFront:nil];
        
    _game = new Game(rect.size.width, rect.size.height);
    _game->init();

    [[NSNotificationCenter defaultCenter] addObserver:self 
        selector:@selector(windowWillMiniaturizeNotification)name:NSWindowWillMiniaturizeNotification 
        object:_window];
    [[NSNotificationCenter defaultCenter] addObserver:self 
        selector:@selector(windowDidDeminiaturizeNotification)name:NSWindowDidDeminiaturizeNotification 
        object:_window];
    
    NSImageView *backgroundView = [[NSImageView alloc] initWithFrame: NSMakeRect(0, 0, rect.size.width, rect.size.height)];
    backgroundView.imageAlignment = NSImageAlignCenter;
    backgroundView.imageScaling = NSImageScaleNone;
    backgroundView.image = [NSImage imageNamed:@"LaunchImage.png"];
    [self.viewController.view addSubview:backgroundView];
    
}

- (void) removeLaunchImage
{
    for (NSView* subview in self.viewController.view.subviews)
    {
        if ([subview isKindOfClass:[NSImageView class]])
            [subview removeFromSuperview];
    }
}

- (void)windowWillMiniaturizeNotification
{
    _game->onPause();
}

- (void)windowDidDeminiaturizeNotification
{
    _game->onResume();
}

- (NSWindow*)getWindow
{
    return _window;
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
    delete _game;
    //FIXME: will crash if relase it here.
    // [_window release];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)theApplication {
    return YES;
}

@end
