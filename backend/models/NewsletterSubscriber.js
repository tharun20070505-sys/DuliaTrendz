import { createTursoModel } from '../config/tursoModel.js';

const NewsletterSubscriber = createTursoModel('NewsletterSubscriber', 'newsletter_subscribers', {
  defaults: {
    active: true,
  },
});

export default NewsletterSubscriber;
