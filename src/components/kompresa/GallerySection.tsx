'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoSSR } from '@/components/ui/no-ssr';
import { Play, Camera, Youtube, ImagePlus } from 'lucide-react';
import { useT, type DictKey } from '@/lib/i18n';

type GalleryItem = {
  id: string;
  type: 'video' | 'image';
  titleKey: DictKey;
};

const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    type: 'video',
    titleKey: 'gallery.cap1',
  },
  {
    id: 'g2',
    type: 'video',
    titleKey: 'gallery.cap2',
  },
  {
    id: 'g3',
    type: 'video',
    titleKey: 'gallery.cap3',
  },
  {
    id: 'g4',
    type: 'image',
    titleKey: 'gallery.cap4',
  },
  {
    id: 'g5',
    type: 'image',
    titleKey: 'gallery.cap5',
  },
  {
    id: 'g6',
    type: 'image',
    titleKey: 'gallery.cap6',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 180, damping: 18 },
  },
};

export function GallerySection() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const handleItemClick = (item: GalleryItem) => {
    if (item.type === 'video') {
      setSelectedItem(item);
      setDialogOpen(true);
    }
  };

  return (
    <section id="galeri" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-3"
          >
            <ImagePlus className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-teal-800 text-sm font-semibold">
              {t('gallery.badge')}
            </span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t('gallery.heading1')} <span className="text-teal-800">{t('gallery.headingHighlight')}</span>
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {galleryItems.map((item) => (
            <motion.div key={item.id} variants={cardVariants}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card
                  className="group cursor-pointer border border-gray-200 hover:border-teal-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    {item.type === 'video' ? (
                      <>
                        {/* Video thumbnail placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900" />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        {/* Video type badge */}
                        <Badge className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] px-2 font-semibold gap-1">
                          <Youtube className="h-3 w-3" />
                          VIDEO
                        </Badge>
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-white group-hover:shadow-xl transition-all duration-300"
                          >
                            <Play className="h-6 w-6 sm:h-7 sm:w-7 text-slate-800 ml-1" fill="currentColor" />
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Image placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-100" />
                        {/* Image type badge */}
                        <Badge className="absolute top-3 left-3 z-10 bg-teal-700 text-white text-[10px] px-2 font-semibold gap-1">
                          <Camera className="h-3 w-3" />
                          FOTO
                        </Badge>
                        {/* Camera icon */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <Camera className="h-12 w-12 text-teal-300 group-hover:text-teal-400 transition-colors duration-300" />
                        </div>
                      </>
                    )}
                  </div>
                  {/* Title bar */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {t(item.titleKey)}
                    </h3>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Video Dialog - wrapped in NoSSR */}
        <NoSSR>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-gray-900">
                  <Youtube className="h-5 w-5 text-red-600" />
                  {selectedItem?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-4">
                {/* Styled iframe placeholder */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <Play className="h-7 w-7 text-slate-400 ml-0.5" fill="currentColor" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    Video akan segera hadir
                  </p>
                  <p className="text-slate-400 text-xs">
                    Konten video sedang dalam persiapan
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </NoSSR>
      </div>
    </section>
  );
}
