import pyttsx3
import weakref

_engine = None

def speaker(ai_response):
    global _engine
    
    try:
        # Clean up old engine if exists
        if _engine is not None:
            try:
                _engine.stop()
            except:
                pass
            _engine = None
        
        # Create new engine
        _engine = pyttsx3.init()
        _engine.setProperty("rate", 170)
        _engine.setProperty("volume", 0.5)
        
        # Speak
        _engine.say(ai_response)
        _engine.runAndWait()
        
    except Exception as e:
        print(f"TTS Error: {e}")
    finally:
        # Always cleanup
        if _engine is not None:
            try:
                _engine.stop()
            except:
                pass