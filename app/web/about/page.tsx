'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  Heart,
  MapPin,
  Music,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { LoadingScreen } from '@/components/loading-screen';
import { StickySaveBar } from '@/components/cms/sticky-save-bar';
import { ImagePicker } from '@/components/image-picker';
import {
  AddItemButton,
  FormField,
  FormSection,
  ItemCard,
  inputClass,
  selectClass,
  slugify,
  textareaClass,
} from '@/components/cms/form-section';
import { useUpdateWebsiteContent, useAboutContent } from '@/lib/hooks/useWebsiteContent';
import type {
  AboutContent,
  AboutCoreValue,
  AboutMinistry,
  AboutPastor,
  AboutServiceTime,
} from '@/lib/types';
import { Church } from 'lucide-react';

const CORE_VALUE_ICON_OPTIONS = [
  { value: 'BookOpen', label: 'Book / Bible', Icon: BookOpen },
  { value: 'Heart', label: 'Heart / Love', Icon: Heart },
  { value: 'Users', label: 'People / Community', Icon: Users },
  { value: 'Music', label: 'Music / Worship', Icon: Music },
  { value: 'MapPin', label: 'Location / Outreach', Icon: MapPin },
  { value: 'Clock', label: 'Time / Stewardship', Icon: Clock },
] as const;

function newId() {
  return crypto.randomUUID();
}

function emptyPastor(): AboutPastor {
  return { id: newId(), name: '', role: '', bio: '', image: '' };
}

function emptyMinistry(): AboutMinistry {
  return { id: newId(), slug: '', name: '', description: '', leader: '', image: '', meetingTime: '' };
}

function emptyCoreValue(): AboutCoreValue {
  return { icon: 'BookOpen', title: '', description: '' };
}

function emptyServiceTime(): AboutServiceTime {
  return { title: '', times: [''] };
}

export default function AboutContentPage() {
  const { data, isLoading } = useAboutContent();
  const updateMutation = useUpdateWebsiteContent('about');
  const [form, setForm] = useState<AboutContent | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaveMessage(null);
    try {
      const cleaned: AboutContent = {
        ...form,
        coreValues: form.coreValues.filter((v) => v.title.trim()),
        pastors: form.pastors.filter((p) => p.name.trim()),
        ministries: form.ministries
          .filter((m) => m.name.trim())
          .map((m) => ({ ...m, slug: m.slug.trim() || slugify(m.name) })),
        serviceTimes: form.serviceTimes
          .filter((s) => s.title.trim())
          .map((s) => ({ ...s, times: s.times.filter((t) => t.trim()) })),
      };

      await updateMutation.mutateAsync(cleaned);
      setForm(cleaned);
      setSaveMessage('About page saved successfully.');
    } catch (error) {
      console.error(error);
      setSaveMessage('Could not save. Please try again.');
    }
  };

  if (isLoading || !form) return <LoadingScreen message="Loading about content..." />;

  return (
    <>
      <PageHeader
        title="Church / About Page"
        description="Edit what visitors see on the About page — no technical knowledge needed."
        icon={Church}
        backHref="/web"
      />

      <form onSubmit={handleSubmit} className="space-y-6 pb-28">
        <FormSection
          title="Hero banner"
          description="The large image and headline at the top of the About page."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Page headline">
              <input
                className={inputClass}
                value={form.hero.title}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })}
                placeholder="About Fountain Gate Chapel"
              />
            </FormField>
            <FormField label="Subtitle">
              <input
                className={inputClass}
                value={form.hero.subtitle}
                onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitle: e.target.value } })}
                placeholder="A place where faith meets community"
              />
            </FormField>
          </div>
          <ImagePicker
            label="Banner image"
            value={form.hero.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, hero: { ...form.hero, imageUrl } })}
            uploadPathPrefix="website/about/hero"
          />
        </FormSection>

        <FormSection title="Vision & mission" description="Short statements about why the church exists.">
          <FormField label="Our vision">
            <textarea
              rows={4}
              className={textareaClass}
              value={form.vision}
              onChange={(e) => setForm({ ...form, vision: e.target.value })}
              placeholder="Where is God leading your church?"
            />
          </FormField>
          <FormField label="Our mission">
            <textarea
              rows={4}
              className={textareaClass}
              value={form.mission}
              onChange={(e) => setForm({ ...form, mission: e.target.value })}
              placeholder="What does your church do every day?"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Core values"
          description="Principles shown as cards on the About page. Pick an icon, add a title and short description."
        >
          <div className="space-y-4">
            {form.coreValues.map((value, index) => (
              <ItemCard
                key={`${value.title}-${index}`}
                title={`Value ${index + 1}`}
                onRemove={() =>
                  setForm({
                    ...form,
                    coreValues: form.coreValues.filter((_, i) => i !== index),
                  })
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Icon">
                    <select
                      className={selectClass}
                      value={value.icon}
                      onChange={(e) => {
                        const next = [...form.coreValues];
                        next[index] = { ...value, icon: e.target.value };
                        setForm({ ...form, coreValues: next });
                      }}
                    >
                      {CORE_VALUE_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Title">
                    <input
                      className={inputClass}
                      value={value.title}
                      onChange={(e) => {
                        const next = [...form.coreValues];
                        next[index] = { ...value, title: e.target.value };
                        setForm({ ...form, coreValues: next });
                      }}
                      placeholder="Biblical Foundation"
                    />
                  </FormField>
                </div>
                <FormField label="Description">
                  <textarea
                    rows={2}
                    className={textareaClass}
                    value={value.description}
                    onChange={(e) => {
                      const next = [...form.coreValues];
                      next[index] = { ...value, description: e.target.value };
                      setForm({ ...form, coreValues: next });
                    }}
                    placeholder="A short sentence explaining this value"
                  />
                </FormField>
              </ItemCard>
            ))}
          </div>
          <AddItemButton
            label="Add core value"
            onClick={() => setForm({ ...form, coreValues: [...form.coreValues, emptyCoreValue()] })}
          />
        </FormSection>

        <FormSection
          title="Leadership team"
          description="Pastors and leaders shown with photo, name, role, and bio."
        >
          <div className="space-y-4">
            {form.pastors.map((pastor, index) => (
              <ItemCard
                key={pastor.id}
                title={pastor.name.trim() || `Leader ${index + 1}`}
                onRemove={() =>
                  setForm({ ...form, pastors: form.pastors.filter((_, i) => i !== index) })
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Full name">
                    <input
                      className={inputClass}
                      value={pastor.name}
                      onChange={(e) => {
                        const next = [...form.pastors];
                        next[index] = { ...pastor, name: e.target.value };
                        setForm({ ...form, pastors: next });
                      }}
                      placeholder="Pastor Emmanuel Adjei"
                    />
                  </FormField>
                  <FormField label="Role / title">
                    <input
                      className={inputClass}
                      value={pastor.role}
                      onChange={(e) => {
                        const next = [...form.pastors];
                        next[index] = { ...pastor, role: e.target.value };
                        setForm({ ...form, pastors: next });
                      }}
                      placeholder="Lead Pastor"
                    />
                  </FormField>
                </div>
                <FormField label="Short bio">
                  <textarea
                    rows={3}
                    className={textareaClass}
                    value={pastor.bio}
                    onChange={(e) => {
                      const next = [...form.pastors];
                      next[index] = { ...pastor, bio: e.target.value };
                      setForm({ ...form, pastors: next });
                    }}
                    placeholder="A few sentences about this leader"
                  />
                </FormField>
                <ImagePicker
                  label="Photo"
                  value={pastor.image}
                  onChange={(image) => {
                    const next = [...form.pastors];
                    next[index] = { ...pastor, image };
                    setForm({ ...form, pastors: next });
                  }}
                  uploadPathPrefix={`website/about/leaders/${pastor.id}`}
                />
              </ItemCard>
            ))}
          </div>
          <AddItemButton
            label="Add leader"
            onClick={() => setForm({ ...form, pastors: [...form.pastors, emptyPastor()] })}
          />
        </FormSection>

        <FormSection
          title="Ministries"
          description="Ministry cards with image, leader, and meeting time."
        >
          <div className="space-y-4">
            {form.ministries.map((ministry, index) => (
              <ItemCard
                key={ministry.id}
                title={ministry.name.trim() || `Ministry ${index + 1}`}
                onRemove={() =>
                  setForm({ ...form, ministries: form.ministries.filter((_, i) => i !== index) })
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Ministry name">
                    <input
                      className={inputClass}
                      value={ministry.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const next = [...form.ministries];
                        next[index] = {
                          ...ministry,
                          name,
                          slug: ministry.slug || slugify(name),
                        };
                        setForm({ ...form, ministries: next });
                      }}
                      placeholder="Worship Ministry"
                    />
                  </FormField>
                  <FormField label="Leader" hint="Who leads this ministry?">
                    <input
                      className={inputClass}
                      value={ministry.leader}
                      onChange={(e) => {
                        const next = [...form.ministries];
                        next[index] = { ...ministry, leader: e.target.value };
                        setForm({ ...form, ministries: next });
                      }}
                      placeholder="Minister Abena Asante"
                    />
                  </FormField>
                </div>
                <FormField label="Description">
                  <textarea
                    rows={3}
                    className={textareaClass}
                    value={ministry.description}
                    onChange={(e) => {
                      const next = [...form.ministries];
                      next[index] = { ...ministry, description: e.target.value };
                      setForm({ ...form, ministries: next });
                    }}
                    placeholder="What this ministry does"
                  />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Meeting time">
                    <input
                      className={inputClass}
                      value={ministry.meetingTime}
                      onChange={(e) => {
                        const next = [...form.ministries];
                        next[index] = { ...ministry, meetingTime: e.target.value };
                        setForm({ ...form, ministries: next });
                      }}
                      placeholder="Saturdays at 4:00 PM"
                    />
                  </FormField>
                  <FormField label="Web link slug" hint="Auto-filled from name; used in URLs.">
                    <input
                      className={inputClass}
                      value={ministry.slug}
                      onChange={(e) => {
                        const next = [...form.ministries];
                        next[index] = { ...ministry, slug: slugify(e.target.value) };
                        setForm({ ...form, ministries: next });
                      }}
                      placeholder="worship"
                    />
                  </FormField>
                </div>
                <ImagePicker
                  label="Ministry photo"
                  value={ministry.image}
                  onChange={(image) => {
                    const next = [...form.ministries];
                    next[index] = { ...ministry, image };
                    setForm({ ...form, ministries: next });
                  }}
                  uploadPathPrefix={`website/about/ministries/${ministry.id}`}
                />
              </ItemCard>
            ))}
          </div>
          <AddItemButton
            label="Add ministry"
            onClick={() => setForm({ ...form, ministries: [...form.ministries, emptyMinistry()] })}
          />
        </FormSection>

        <FormSection
          title="Service times"
          description="Group your services (e.g. Sunday, Midweek) and list each time slot."
        >
          <div className="space-y-4">
            {form.serviceTimes.map((group, groupIndex) => (
              <ItemCard
                key={`${group.title}-${groupIndex}`}
                title={group.title.trim() || `Schedule ${groupIndex + 1}`}
                onRemove={() =>
                  setForm({
                    ...form,
                    serviceTimes: form.serviceTimes.filter((_, i) => i !== groupIndex),
                  })
                }
              >
                <FormField label="Section title">
                  <input
                    className={inputClass}
                    value={group.title}
                    onChange={(e) => {
                      const next = [...form.serviceTimes];
                      next[groupIndex] = { ...group, title: e.target.value };
                      setForm({ ...form, serviceTimes: next });
                    }}
                    placeholder="Sunday Services"
                  />
                </FormField>
                <FormField label="Times" hint="Add one row for each service time.">
                  <div className="space-y-2">
                    {group.times.map((time, timeIndex) => (
                      <div key={timeIndex} className="flex gap-2">
                        <input
                          className={inputClass}
                          value={time}
                          onChange={(e) => {
                            const next = [...form.serviceTimes];
                            const times = [...group.times];
                            times[timeIndex] = e.target.value;
                            next[groupIndex] = { ...group, times };
                            setForm({ ...form, serviceTimes: next });
                          }}
                          placeholder="First Service: 7:00 AM"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...form.serviceTimes];
                            next[groupIndex] = {
                              ...group,
                              times: group.times.filter((_, i) => i !== timeIndex),
                            };
                            setForm({ ...form, serviceTimes: next });
                          }}
                          className="shrink-0 p-2.5 rounded-lg border border-input hover:bg-muted/50 text-muted-foreground"
                          aria-label="Remove time"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...form.serviceTimes];
                        next[groupIndex] = { ...group, times: [...group.times, ''] };
                        setForm({ ...form, serviceTimes: next });
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Add another time
                    </button>
                  </div>
                </FormField>
              </ItemCard>
            ))}
          </div>
          <AddItemButton
            label="Add service schedule"
            onClick={() =>
              setForm({ ...form, serviceTimes: [...form.serviceTimes, emptyServiceTime()] })
            }
          />
        </FormSection>

        <FormSection title="Location" description="Address and map shown on the About page.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Location name">
              <input
                className={inputClass}
                value={form.location.name}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, name: e.target.value } })
                }
              />
            </FormField>
            <FormField label="City / region">
              <input
                className={inputClass}
                value={form.location.city}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, city: e.target.value } })
                }
              />
            </FormField>
          </div>
          <FormField label="Street address">
            <input
              className={inputClass}
              value={form.location.address}
              onChange={(e) =>
                setForm({ ...form, location: { ...form.location, address: e.target.value } })
              }
            />
          </FormField>
          <FormField
            label="Google Maps embed link"
            hint="In Google Maps: Share → Embed a map → copy the src URL from the iframe code."
          >
            <input
              className={inputClass}
              value={form.location.mapEmbedUrl}
              onChange={(e) =>
                setForm({ ...form, location: { ...form.location, mapEmbedUrl: e.target.value } })
              }
              placeholder="https://www.google.com/maps/embed?..."
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Bottom call to action"
          description="The invite section at the end of the About page."
        >
          <FormField label="Heading">
            <input
              className={inputClass}
              value={form.cta.title}
              onChange={(e) => setForm({ ...form, cta: { ...form.cta, title: e.target.value } })}
            />
          </FormField>
          <FormField label="Message">
            <textarea
              rows={3}
              className={textareaClass}
              value={form.cta.description}
              onChange={(e) => setForm({ ...form, cta: { ...form.cta, description: e.target.value } })}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Primary button text">
              <input
                className={inputClass}
                value={form.cta.primaryButtonText}
                onChange={(e) =>
                  setForm({ ...form, cta: { ...form.cta, primaryButtonText: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Primary button link">
              <input
                className={inputClass}
                value={form.cta.primaryButtonHref}
                onChange={(e) =>
                  setForm({ ...form, cta: { ...form.cta, primaryButtonHref: e.target.value } })
                }
                placeholder="/connect/visit"
              />
            </FormField>
            <FormField label="Secondary button text">
              <input
                className={inputClass}
                value={form.cta.secondaryButtonText}
                onChange={(e) =>
                  setForm({ ...form, cta: { ...form.cta, secondaryButtonText: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Secondary button link">
              <input
                className={inputClass}
                value={form.cta.secondaryButtonHref}
                onChange={(e) =>
                  setForm({ ...form, cta: { ...form.cta, secondaryButtonHref: e.target.value } })
                }
                placeholder="/connect"
              />
            </FormField>
          </div>
        </FormSection>

        <StickySaveBar
          message={saveMessage}
          isSaving={updateMutation.isPending}
          saveLabel="Save About Page"
        />
      </form>
    </>
  );
}
