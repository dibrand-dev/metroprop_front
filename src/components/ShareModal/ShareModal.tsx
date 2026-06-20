'use client';

import './ShareModal.scss';
import {
  WhatsappShareButton, WhatsappIcon,
  FacebookShareButton, FacebookIcon,
  TwitterShareButton, TwitterIcon,
  TelegramShareButton, TelegramIcon,
  LinkedinShareButton, LinkedinIcon,
  RedditShareButton, RedditIcon,
  PinterestShareButton, PinterestIcon,
  TumblrShareButton, TumblrIcon,
  EmailShareButton, EmailIcon,
  ViberShareButton, ViberIcon,
  LineShareButton, LineIcon,
  PocketShareButton, PocketIcon,
  InstapaperShareButton, InstapaperIcon,
  FacebookMessengerShareButton, FacebookMessengerIcon,
} from 'next-share';
import type { CreateProperty } from '@/types/propiedad';
import { generatePropertySlug } from '@/utils/utils';
import { useLocations } from '@/lib/locations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: number;
  property?: CreateProperty;
}

const ICON_SIZE = 48;
const ICON_ROUND = true;

export default function ShareModal({ isOpen, onClose, property, propertyId }: ShareModalProps) {
  const { data: locations = [] } = useLocations();
  
  if (!isOpen) return null;

  const id = property?.id ?? propertyId;
  
  // Build location labels from the locations data if we have IDs but no relationship objects
  let locationLabels: { subLocation?: string; location?: string; state?: string } | undefined;
  if (property && locations.length > 0) {
    const subLocationLabel = property.sub_location_id 
      ? locations.find(l => l.id === property.sub_location_id)?.name 
      : undefined;
    const locationLabel = property.location_id
      ? locations.find(l => l.id === property.location_id)?.name
      : undefined;
    const stateLabel = property.state_id
      ? locations.find(l => l.id === property.state_id)?.name
      : undefined;
    
    if (subLocationLabel || locationLabel || stateLabel) {
      locationLabels = {
        subLocation: subLocationLabel,
        location: locationLabel,
        state: stateLabel,
      };
    }
  }
  
  // Use SEO-friendly URL if full property object is available, otherwise fallback to old format
  const url = property 
    ? `https://metroprop.co/${generatePropertySlug(property, locationLabels)}` 
    : `https://metroprop.co/propertyDetail/${id}`;
  const title = property?.publication_title ?? 'Mira esta propiedad que encontré en Metroprop';
  const shareText = `Mira esta propiedad que encontré en Metroprop: ${title}`;
  const media = (property as any)?.images?.[0]?.url ?? '';

  const buttons = [
    {
      label: 'WhatsApp',
      button: (
        <WhatsappShareButton url={url} title={shareText} separator=" — ">
          <WhatsappIcon size={ICON_SIZE} round={ICON_ROUND} />
        </WhatsappShareButton>
      ),
    },
    {
      label: 'Facebook',
      button: (
        <FacebookShareButton url={url} quote={shareText}>
          <FacebookIcon size={ICON_SIZE} round={ICON_ROUND} />
        </FacebookShareButton>
      ),
    },
    {
      label: 'Messenger',
      button: (
        <FacebookMessengerShareButton url={url} appId="">
          <FacebookMessengerIcon size={ICON_SIZE} round={ICON_ROUND} />
        </FacebookMessengerShareButton>
      ),
    },
    {
      label: 'Twitter / X',
      button: (
        <TwitterShareButton url={url} title={shareText}>
          <TwitterIcon size={ICON_SIZE} round={ICON_ROUND} />
        </TwitterShareButton>
      ),
    },
    {
      label: 'Telegram',
      button: (
        <TelegramShareButton url={url} title={shareText}>
          <TelegramIcon size={ICON_SIZE} round={ICON_ROUND} />
        </TelegramShareButton>
      ),
    },
    {
      label: 'LinkedIn',
      button: (
        <LinkedinShareButton url={url} title={title}>
          <LinkedinIcon size={ICON_SIZE} round={ICON_ROUND} />
        </LinkedinShareButton>
      ),
    },
    {
      label: 'Reddit',
      button: (
        <RedditShareButton url={url} title={shareText}>
          <RedditIcon size={ICON_SIZE} round={ICON_ROUND} />
        </RedditShareButton>
      ),
    },
    {
      label: 'Pinterest',
      button: (
        <PinterestShareButton url={url} media={media} description={shareText}>
          <PinterestIcon size={ICON_SIZE} round={ICON_ROUND} />
        </PinterestShareButton>
      ),
    },
    {
      label: 'Tumblr',
      button: (
        <TumblrShareButton url={url} title={title} caption={shareText}>
          <TumblrIcon size={ICON_SIZE} round={ICON_ROUND} />
        </TumblrShareButton>
      ),
    },
    {
      label: 'Viber',
      button: (
        <ViberShareButton url={url} title={shareText}>
          <ViberIcon size={ICON_SIZE} round={ICON_ROUND} />
        </ViberShareButton>
      ),
    },
    {
      label: 'Line',
      button: (
        <LineShareButton url={url} title={shareText}>
          <LineIcon size={ICON_SIZE} round={ICON_ROUND} />
        </LineShareButton>
      ),
    },
    {
      label: 'Pocket',
      button: (
        <PocketShareButton url={url} title={title}>
          <PocketIcon size={ICON_SIZE} round={ICON_ROUND} />
        </PocketShareButton>
      ),
    },
    {
      label: 'Instapaper',
      button: (
        <InstapaperShareButton url={url} title={title} description={shareText}>
          <InstapaperIcon size={ICON_SIZE} round={ICON_ROUND} />
        </InstapaperShareButton>
      ),
    },
    {
      label: 'Email',
      button: (
        <EmailShareButton url={url} subject={title} body={shareText} separator=" — ">
          <EmailIcon size={ICON_SIZE} round={ICON_ROUND} />
        </EmailShareButton>
      ),
    },
  ];

  return (
    <div className="share-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Compartir propiedad">
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3 className="share-modal-title">Compartir propiedad</h3>
          <button
            type="button"
            className="share-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="share-modal-url">{url}</p>

        <div className="share-modal-grid">
          {buttons.map(({ label, button }) => (
            <div key={label} className="share-modal-item">
              {button}
              <span className="share-modal-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
