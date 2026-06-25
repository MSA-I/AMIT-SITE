import { motion } from 'framer-motion';
import { useI18n } from '../../i18n/context';
import { Container, Section, Heading, Rule, staggerParent, staggerChild } from '../ui';

export default function Services() {
  const { t } = useI18n();

  return (
    <Section id="services" className="bg-bg">
      <Container>
        <Heading eyebrow={t.services.eyebrow} title={t.services.heading} />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:mt-16 md:grid-cols-3"
        >
          {t.services.groups.map((group) => (
            <motion.div
              key={group.title}
              variants={staggerChild}
              className="flex flex-col gap-6 bg-bg p-8 md:p-10"
            >
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-xl font-medium tracking-tight text-ink">
                  {group.title}
                </h3>
                <Rule />
              </div>

              <ul className="flex flex-col gap-3.5 text-start">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted">
                    <span
                      className="mt-[0.5rem] size-1.5 shrink-0 bg-copper"
                      aria-hidden
                    />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
