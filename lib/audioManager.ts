/**
 * Global Audio Manager
 * Manages audio playback across the application, ensuring music continues
 * even when switching tabs or navigating within the app.
 */

import { toast } from './toast';

type AudioState = {
  volume: number;
  muted: boolean;
};

class AudioManager {
  private audios: Record<string, HTMLAudioElement> = {};
  private states: Record<string, AudioState> = {};
  private initialized = false;
  private hasShownAutoplayWarning = false;

  /**
   * Initialize audio elements for given sounds
   */
  initialize(sounds: Array<{ id: string; url: string }>) {
    if (this.initialized) return;

    sounds.forEach((sound) => {
      try {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = 0;
        // Prevent audio from being paused when tab is inactive
        audio.setAttribute('playsinline', 'true');
        
        // Handle audio loading errors
        audio.addEventListener('error', () => {
          const errorMsg = this.getAudioErrorMessage(audio.error);
          toast.error(`Failed to load ${sound.id} audio: ${errorMsg}`);
        });

        this.audios[sound.id] = audio;
        this.states[sound.id] = { volume: 0, muted: false };
      } catch (error) {
        toast.error(`Failed to initialize ${sound.id} audio`);
        console.error(`Audio initialization error for ${sound.id}:`, error);
      }
    });

    this.initialized = true;

    // Handle page visibility changes to ensure audio keeps playing
    this.setupVisibilityHandler();
  }

  /**
   * Get user-friendly error message from MediaError
   */
  private getAudioErrorMessage(error: MediaError | null): string {
    if (!error) return 'Unknown error';
    
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Loading aborted';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Decoding error';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Format not supported';
      default:
        return 'Unknown error';
    }
  }

  /**
   * Setup visibility handler to resume audio when tab becomes visible
   */
  private setupVisibilityHandler() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Resume any audio that should be playing when tab becomes visible
        Object.entries(this.states).forEach(([id, state]) => {
          const audio = this.audios[id];
          if (audio && state.volume > 0 && !state.muted && audio.paused) {
            audio.play().catch((error) => {
              console.warn(`Failed to resume ${id} audio:`, error);
            });
          }
        });
      }
    });
  }

  /**
   * Update audio playback state
   */
  updateAudio(id: string, volume: number, muted: boolean) {
    const audio = this.audios[id];
    if (!audio) return;

    // Update state
    this.states[id] = { volume, muted };

    const effectiveVolume = muted ? 0 : volume / 100;
    audio.volume = effectiveVolume;

    if (volume > 0 && !muted) {
      if (audio.paused) {
        audio.play().catch((error) => {
          // Handle autoplay restrictions
          if (error.name === 'NotAllowedError' && !this.hasShownAutoplayWarning) {
            toast.warning('Audio autoplay blocked. Please interact with the page first.');
            this.hasShownAutoplayWarning = true;
          } else if (error.name !== 'NotAllowedError') {
            toast.error(`Failed to play ${id} audio`);
            console.error(`Audio playback error for ${id}:`, error);
          }
        });
      }
    } else {
      audio.pause();
    }
  }

  /**
   * Get current state for a sound
   */
  getState(id: string): AudioState | undefined {
    return this.states[id];
  }

  /**
   * Get all current audio states
   */
  getAllStates(): Record<string, AudioState> {
    return { ...this.states };
  }

  /**
   * Stop all audio
   */
  stopAll() {
    Object.values(this.audios).forEach((audio) => {
      audio.pause();
      audio.volume = 0;
    });
    Object.keys(this.states).forEach((id) => {
      this.states[id] = { volume: 0, muted: false };
    });
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    Object.values(this.audios).forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.audios = {};
    this.states = {};
    this.initialized = false;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
