import { ServiceContainer } from './container';

const start = () => {
  try {
    // bootstrap the app
    ServiceContainer.create();

    console.log('Bot is running...');
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

start();
