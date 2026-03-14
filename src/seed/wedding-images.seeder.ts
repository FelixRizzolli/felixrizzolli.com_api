import { Payload } from 'payload';
import crypto from 'crypto';
import { CollectionSlug } from '@/lib/constants';

const WEDDING_IMAGES_CDN = process.env.WEDDING_IMAGES_CDN;
const WEDDING_FOTOBOX_PREFIX = process.env.WEDDING_FOTOBOX_PREFIX;
const WEDDING_FOTOBOX_TOTAL = Number(process.env.WEDDING_FOTOBOX_TOTAL);
const WEDDING_PHOTOGRAPHER_PREFIX = process.env.WEDDING_PHOTOGRAPHER_PREFIX;
const WEDDING_PHOTOGRAPHER_TOTAL = Number(process.env.WEDDING_PHOTOGRAPHER_TOTAL);

interface GeneratedWeddingImage {
  ident: string;
  cloudflareLink: string;
}

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding wedding images...');

  const weddingImages: Array<GeneratedWeddingImage> = [];

  for (let i = 1; i <= WEDDING_FOTOBOX_TOTAL; i++) {
    const ident = `${WEDDING_FOTOBOX_PREFIX}-${i}`;
    const hash = crypto.createHash('sha256').update(ident).digest('hex');
    const cloudflareLink = `${WEDDING_IMAGES_CDN}/${hash}.jpg`;

    weddingImages.push({
      ident,
      cloudflareLink,
    });
  }

  for (let i = 1; i <= WEDDING_PHOTOGRAPHER_TOTAL; i++) {
    const ident = `${WEDDING_PHOTOGRAPHER_PREFIX}-${i}`;
    const hash = crypto.createHash('sha256').update(ident).digest('hex');
    const cloudflareLink = `${WEDDING_IMAGES_CDN}/${hash}.jpg`;

    weddingImages.push({
      ident,
      cloudflareLink,
    });
  }

  for (const weddingImage of weddingImages) {
    const { docs: images } = await payload.find({
      collection: CollectionSlug.WEDDING_IMAGES,
      where: { ident: { equals: weddingImage.ident } },
      limit: 1,
    });

    if (images.length > 0) {
      await payload.update({
        collection: CollectionSlug.WEDDING_IMAGES,
        where: { ident: { equals: weddingImage.ident } },
        data: {
          cloudflareLink: weddingImage.cloudflareLink,
        },
      });
      payload.logger.info(`Wedding Image ${weddingImage.ident} updated successfully!`);
    } else {
      await payload.create({
        collection: CollectionSlug.WEDDING_IMAGES,
        data: weddingImage,
        draft: false,
      } as any);
      payload.logger.info(`Wedding Image ${weddingImage.ident} created successfully!`);
    }
  }

  payload.logger.info('Wedding images seeded successfully.');
};
