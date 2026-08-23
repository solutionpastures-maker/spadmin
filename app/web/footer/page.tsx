'use client';

import { useEffect, useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import {
  FormField,
  FormSection,
  inputClass,
  textareaClass,
} from '@/components/cms/form-section';
import { FooterLinkGroupsEditor } from '@/components/cms/link-list-editor';
import { SocialLinksEditor } from '@/components/cms/social-links-editor';
import { StickySaveBar } from '@/components/cms/sticky-save-bar';
import { useUpdateWebsiteContent, useFooterContent } from '@/lib/hooks/useWebsiteContent';
import type { FooterContent } from '@/lib/types';

export default function FooterContentPage() {
  const { data, isLoading } = useFooterContent();
  const updateMutation = useUpdateWebsiteContent('footer');
  const [form, setForm] = useState<FooterContent | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaveMessage(null);
    try {
      await updateMutation.mutateAsync({
        ...form,
        serviceTimes: form.serviceTimes.map((line) => line.trim()).filter(Boolean),
        linkGroups: {
          watch: form.linkGroups.watch.filter((l) => l.label.trim() && l.href.trim()),
          grow: form.linkGroups.grow.filter((l) => l.label.trim() && l.href.trim()),
          church: form.linkGroups.church.filter((l) => l.label.trim() && l.href.trim()),
          connect: form.linkGroups.connect.filter((l) => l.label.trim() && l.href.trim()),
          give: form.linkGroups.give.filter((l) => l.label.trim() && l.href.trim()),
        },
        socialLinks: form.socialLinks.filter((l) => l.href.trim()),
      });
      setSaveMessage('Footer saved successfully.');
    } catch (error) {
      console.error(error);
      setSaveMessage('Could not save footer. Please try again.');
    }
  };

  if (isLoading || !form) return <LoadingScreen message="Loading footer content..." />;

  return (
    <>
      <PageHeader
        title="Footer Content"
        description="Edit contact info, footer links, and social media — shown on every page."
        icon={LayoutTemplate}
        backHref="/web"
      />

      <form onSubmit={handleSubmit} className="space-y-6 pb-28">
        <FormSection title="Church details" description="Name, address, and contact info in the footer.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Church name">
              <input
                className={inputClass}
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              />
            </FormField>
            <FormField label="Subtitle">
              <input
                className={inputClass}
                value={form.brandSubtitle}
                onChange={(e) => setForm({ ...form, brandSubtitle: e.target.value })}
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Address line 1">
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </FormField>
            <FormField label="Address line 2">
              <input
                className={inputClass}
                value={form.addressLine2 || ''}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              />
            </FormField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email">
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
            <FormField label="Copyright text">
              <input
                className={inputClass}
                value={form.copyrightText || ''}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                placeholder="Fountain Gate Chapel. All rights reserved."
              />
            </FormField>
          </div>
          <FormField label="Service times" hint="One service time per line.">
            <textarea
              rows={4}
              className={textareaClass}
              value={form.serviceTimes.join('\n')}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceTimes: e.target.value.split('\n'),
                })
              }
              placeholder={'Sunday: 8:00 AM & 10:30 AM\nWednesday: 7:00 PM'}
            />
          </FormField>
        </FormSection>

        <FormSection title="Mobile app links" description="App Store and Google Play buttons in the footer.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="App Store link">
              <input
                className={inputClass}
                value={form.appStoreUrl || ''}
                onChange={(e) => setForm({ ...form, appStoreUrl: e.target.value })}
                placeholder="https://apps.apple.com/..."
              />
            </FormField>
            <FormField label="Google Play link">
              <input
                className={inputClass}
                value={form.googlePlayUrl || ''}
                onChange={(e) => setForm({ ...form, googlePlayUrl: e.target.value })}
                placeholder="https://play.google.com/..."
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Footer navigation links"
          description="Five columns of links at the bottom of the site. Use page paths like /about or /give."
        >
          <FooterLinkGroupsEditor
            linkGroups={form.linkGroups}
            onChange={(linkGroups) => setForm({ ...form, linkGroups })}
          />
        </FormSection>

        <FormSection title="Social media" description="Icons linking to your church social profiles.">
          <SocialLinksEditor
            links={form.socialLinks}
            onChange={(socialLinks) => setForm({ ...form, socialLinks })}
          />
        </FormSection>

        <StickySaveBar
          message={saveMessage}
          isSaving={updateMutation.isPending}
          saveLabel="Save Footer"
        />
      </form>
    </>
  );
}
