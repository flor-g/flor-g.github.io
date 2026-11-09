# Prosodic Focus in Speech Tokenization: Disentangling Prosody for Spoken Language Understanding

Flora Gu

---

While Large Language Models demonstrate impressive competence in processing standard text, their performance often falters when facing the complex, multimodal inputs characteristic of embodied AI. In these environments, ambiguity resolution and robust speech comprehension under degraded conditions remains a major challenge for artificial intelligence. Human listeners cope in these environments by exploiting structured redundancy across multiple speech cues, yet many modern speech systems still privilege text-based segmental information for comprehension tasks and underuse the functional signal carried by expressive prosody. This essay argues that systematically incorporating prosodic information of focus in the tokenization process is essential for improving comprehension efficiency and accuracy in speech-processing systems. Accordingly, I evaluate whether current speech representations and discrete units retain the prosodic cues that humans rely on for robust comprehension, and I synthesize what the literature suggests about making these representations more focus-sensitive. The discussion proceeds by (1) defining prosody and focus in the sense relevant here, (2) reviewing listener-side mechanisms by which focus-background contrast supports ambiguity resolution under uncertainty, (3) motivating tokenization as the critical loss point, and (4) surveying emerging prosody-informed tokenization strategies and what evidence exists for their benefits.

## 1 Definitions: Prosody and information structure

Before diving into our discussion, we must first define the scope of our interest: the application of focus-correlated expressive prosody in speech comprehension tasks, and clarify terms in the sense relevant to our discussion.

### 1.1 Classification of prosody at multiple levels

Unlike the discrete and linear text, human speech is realized as a continuous waveform with multiple dimensions such as time, frequency (pitch), and amplitude (intensity). From this waveform, we can extract segmental information such as consonants and syllables. Prosody refers to the suprasegmental patterning that can contribute to meaning and structure at multiple levels. Intonations and pauses that encode word identity or phrase boundary are fundamental components of intelligible speech. At this level, speech systems based on statistical modelling until the 2010s have already achieved high performance [1]. The level yet to be solved is prosody that serves expressive functions beyond lexical and syntactic content. Cases of expressive prosody include prosodic variations that encode sentence modality (e.g., intonational marking of interrogativity vs. declarativity), discourse/interactional structuring (e.g., signaling discourse segmentation or continuation and managing turn-taking expectations), and attitudinal/emotive/social meanings. Speakers can modulate these expressive variations independently of lexical intonations [2], [3–5].

Among the expressive functions of prosody, the subject of our discussion is focus–background contrast. Focus is arguably of foremost relevance in helping artificial intelligence perform robustly in language tasks under multimodal and real-world settings because it is actively involved in ambiguity resolution and robust speech comprehension (see §2).

### 1.2 Prosodic realizations of Focus-Background Contrast (FBC)

To understand how speech processing systems might encode information structure, we must first establish how focus is acoustically realized and perceived. The literature widely agrees that focused or stressed linguistic elements exhibit greater perceptual salience, known as prominence. This prominence is realized primarily through four acoustic correlates: a widened fundamental frequency (F0) range, increased intensity, lengthened duration, and richer spectral harmonics [6].

Contrary to the intuition that focus is merely a localized increase in prominence, functional accounts [7], [8] emphasize that FBC is established through the relative configuration across a phrase. Pre-focus regions show minimal or inconsistent deviation from baseline declination patterns [7], [8] and focused areas show increased prominence. Interestingly, in many languages including English, the post-focus region shows compression of pitch range (and often intensity reduction) not only compared to focused region but also the phrase-level baseline.

This compression helps listeners infer where the focus was placed and prevents listeners from hearing an additional late focus [9]. Listener-facing evidence is consistent with this: focus recognition can depend heavily on the relative smallness of later F0 peaks [10], [9]. For languages that lack significant or stable post-focus compression (e.g. Hong Kong Cantonese) [11], [12], FBC is made salient mainly through increased duration and intensity in the focused region.

Mind that both lexical stress and FBC trigger an increase in prominence, but they exhibit distinct patterns of variation in their acoustic realization [13]. A single instantaneous feature value of prominence would likely not be able to distinguish one from the other. Hence, FBC is best captured at a coarse temporal granularity at which phrase-span prominence contrast is distinct from lexical stress.

### 1.3 Downstream applications of speech tokenization

Our discussion targets how focus prosody may participate in comprehension-side applications. Current speech tokenization research generally serves three distinct downstream applications, each placing different demands on what information the discrete representation must preserve.
- Speech Synthesis (Text-to-speech and Resynthesis): This direction aims to generate speech audio from text or latent representations with high-fidelity waveform reconstruction and perceptual naturalness.
- Spoken Language Modeling: This area involves generative modeling directly from speech audio without an intermediate text transcription[^1], allowing the system to capture nuances often lost in text, such as turn-taking and backchanneling cues. While SLMs have both comprehension and production objectives, current research often leans heavily on the generative capacity to maintain the flow of interaction, including turn-taking and backchanneling cues.
- Spoken Language Understanding (SLU): This domain encompasses tasks where the system must extract meaning, intent, or semantic[^2] commitments from the signal, for example, automatic speech recognition (ASR), intent classification, and slot filling.

Our discussion targets how focus prosody may participate in comprehension-side applications. For SLU and SLM to function robustly, the tokenization interface must preserve the functional prosodic contrasts (specifically Focus-Background Contrast) that allow the model to resolve ambiguity and allocate attention efficiently.

## 2 How prosodic cues of FBC aids speech comprehension

As the scope of our discussion is now set, I will motivate the potential benefit of prosody-aware tokenization with evidence of how humans engage with prosody in speech comprehension.

### 2.1 FBC determines truth condition

Focus–Background Contrast (FBC) constrains how listeners integrate an utterance into context, in particular by indicating which alternatives are relevant for comparison and which material is treated as contextually supported. In Rooth’s alternative semantics [14], focus introduces a set of alternatives, and focus-sensitive operators such as *only* quantify over that set; as a consequence, shifting prosodic focus can yield truth-conditionally distinct readings even when the segmental string is held constant. For example:

(1) I only gave Raj a book.

Here, focus on *Raj* selects other recipients as the alternative set and entails that I didn’t give anyone else the book, while emphasis on *Book* entails that I didn’t give John anything else. The FBC in (1) may also be clear from context, for example, if preceded by either question (2) or (3):

(2) Did you give Raj some sweets?  (3) Did you give everyone a book?

However, in multimodal settings, the context is not always linguistic but may be supplied by the shared perceptual scene or task environment [15]. In such cases, prosodic focus is a primary cue for reconstructing the intended alternative set and successful resolution of semantic ambiguity.

### 2.2 FBC as a guide to inference, prediction, and attention allocation

Prominence-related prosody can influence comprehension even when it does not alter truth conditions, by regulating how listeners manage uncertainty during incremental processing. In this section, the relevant claim is that prominence cues (realized through coordinated variation in F0, duration, and intensity) contribute to online hypothesis management in two closely related ways: (i) reweighting competing interpretations or referents as evidence arrives, and (ii) forming expectations about likely upcoming structure or referents (anticipation) [16].

A demonstration of rapid hypothesis reweighting comes from visual-world eye-tracking. [17] shows that accentual prominence affects reference resolution in real time: listeners’ fixations shift in a manner consistent with using prominence to privilege or demote candidate referents while phonological competition remains active, e.g. can(dle/dy). Going a step further than [17], [18] demonstrated that infelicitous contrastive focus triggered erroneous anticipatory fixations (e.g. blue angel followed by GREEN ball resulted in erroneous fixations to the cell of angels), indicating that focus drives prediction of upcoming content even prior to the acoustic onset of the target word. These studies therefore support that prominence functions as an incremental constraint on interpretation, continuously updating the relative probability of competing candidates as the speech signal unfolds. Notably, noisy environments force the brain to rely even more on prosodic focus as cue for forming top-down semantic prediction to reconstruct the masked signal [19].

Similar to human speakers, speech systems often operate under substantial distribution shifts arising from both transmission degradation (e.g., noise, reverberation, far-field capture) and source variation (e.g., accent and Lombard speech), each introducing distinct failure modes for recognition and downstream understanding [20]. A common engineering response places speech enhancement upstream of ASR, but enhancement artifacts do not reliably reduce word error rates and can even degrade recognition, revealing limitations of pipeline-level robustness strategies [21]. These challenges motivate leaning on prosodic focus as inductive aid because segmental information is not always reliable.

## 3 Tokenization procedure and prosody loss

Having motivated the importance of prosodic focus for accurate and efficient comprehension, I will justify that current speech systems do not properly engage with prosodic focus by discussing the abstraction interface at which most loss of prosodic structure occurs.

### 3.1 Discrete tokenization via continuous features

Tokenization can be defined more generally as a mapping from the continuous speech waveform into a sequence representation that a downstream model can process. In many current systems the downstream model is a Transformer-style LM. The model only has access to prosodic structure insofar as it survives this mapping. Continuous features (which skips tokenization) can preserve richer prosodic detail and is proven to perform better in language comprehension tasks [22], but their associated costs for storage and transmission surpass current commercially viable limits. Accordingly, I focus here on the less costly option and discuss what is lost in tokenization and how the loss can be optimized.

Discrete speech tokenizers typically fall into two families. Acoustic tokens are optimized for waveform reconstruction, which encourages preservation of fine-grained acoustic detail (including prosody) but often yields long token sequences. Semantic tokens are optimized for phonemic or content abstraction, which shortens sequences but may discard or blur span-level prosodic contrasts. Because focus marking is realized as relative patterns across time spans, the tokenization interface constitutes a primary bottleneck for retaining these cues.

### 3.2 Token extraction via clustering and vector quantization

Let \(h_t \in \mathbb{R}^d\) be a frame-level latent produced by an encoder \(f(x)\). Quantization maps \(h_t\) to an index in a finite vocabulary \(V=\{1,\ldots,K\}\) via a codebook \(C=\{c_k\}_{k=1}^K\subset\mathbb{R}^d\),

\[
q(h_t)=\arg\min_{k\in\{1,\ldots,K\}}\lVert h_t-c_k\rVert_2^2,\quad z_t=q(h_t). \tag{1}
\]

Offline clustering instantiates this with k-means centroids [23], while neural vector quantization(VQ) learns the codebook jointly with the encoder.

Semantic tokenizers often apply single-stage VQ to Self Supervised Learning (SSL) hidden states, as in vq-wav2vec [24], whereas acoustic codec[^3] tokenizers place Residual VQ[^4] inside an encoder–decoder module trained for audio reconstruction [26], [27].

Prosody can be attenuated at two major points in this process: (i) quantization is many-to-one, causing prominence differences to collapse, and (ii) codebooks naturally allocate capacity to dominant variance dimensions. These challenges motivate effort to disentangle prosody from segmental information (c.f. §4.1) with a dedicated channel during tokenization.

### 3.3 Acoustic v.s. Semantic tokens and their respective challenges

Since §§1–2 established that focus is encoded as temporal contrast across spans, prosody-aware tokenization should be evaluated not merely by its ability to preserve local acoustic details, but by whether it retains focus contrasts that an attention mechanism can exploit to prioritize semantically relevant time spans.

Acoustic codec tokens are the most direct candidate for preserving focus-related cues, as they are trained for waveform reconstruction and therefore retain fine-grained prosodic detail within bitrate constraints [26], [27]. However, they typically operate at high frame rates and often use multiple codebooks per time step, which inflates sequence length relative to text and can exhaust the effective context budget in SLU settings [23], [22], [28]. Moreover, reconstruction objectives do not guarantee that prosodic variation is factorized in a form useful for comprehension. Without disentanglement, focus-related patterns may be encoded as residual detail entangled with segmental identity, making them difficult and brittle for downstream models to recover [23], [29].

Semantic or SSL-derived tokens address sequence-length concerns by abstracting away fine-grained acoustics and aligning more closely with content modeling [24, 30, 31]. Yet this abstraction can under-specify prosodic variability, since discretization tends to privilege dominant phonemic dimensions that do not encode span-level focus. Consequently, focus contrasts may be blurred unless prosody is explicitly targeted in the token objective [32], [33], represented in additional streams [23], [34], or recoverable from intermediate SSL representations [30], [31]. Hybrid text-aligned approaches further reduce sequence length, but whether they preserve focus-relevant temporal contrast remains an empirical question [35].

As we have now clarified that standard tokenization interfaces risk erasing focus-related temporal contrast in different ways, the next section turns to prosody-informed designs that aim to mitigate this loss.

## 4 Prosody-informed tokenization and future directions

Given that §§ 1–3 motivated focus-prosody-aware tokenization, the remaining question is how to preserve prosody without inheriting the high frame-rate cost of reconstruction-oriented codecs.

### 4.1 Explicit content–prosody disentanglement

As noted in §3.2, a promising solution is disentanglement: instead of leaving prosody as residual variation inside a single content stream, the tokenizer should allocate a dedicated channel for prosodic structure, making focus-related contrast easier to condition on at lower cost. Concretely, a shared encoder can produce a latent \(h_t\), then two learned projections split it into subspace, and the quantizer interface produces a pair of sequences \((u_{1:T}, p_{1:T})\), where stream u indexes content-bearing units and stream p indexes a dedicated prosody or style channel. With this design, the downstream model can more easily discover focus-background contrast in p, rather than searching for them in a shared space dominated by segmental identity.

Most existing disentanglement work, however, is motivated by speech synthesis, where prosody is optimized on controllability and perceptual fidelity. FreeCodec [36] proposes a disentangled codec with a dedicated VQ module for each stream; this factorized design reduces the number of tokens by \(\sim\)60% relative to standard non-disentangled neural codecs. NaturalSpeech 3 [37] similarly relies on a factorized codec representation in a TTS pipeline. However, both [36] and [37]’s factorization is optimized on synthesis quality and paralinguistic style expressivity rather than downstream semantic performance (where focus effects would show).

| Tokenizer Type | Typical Frame Rate (Hz) | Bitrate (kbps) |
|---|---|---|
| SSL-Derived (Semantic) | 12.5 – 50 | 0.08 – 0.3 |
| Acoustic without factorization | 75 – 100+ | 1.0 – 6.0 |
| pGSLM | 50 | \(\sim\)0.5 total |

*Table 1: Cost comparison*

Beyond audio synthesis, pGSLM (prosody-aware Generative Spoken Language Model) [32] represents prosody as three separate streams (i.e. F0, duration, SSL-derived content) with synchronous frame rate. The streams are predicted jointly by a Transformer LM. pGSLM is highly cost efficient (Table 1) as it captures prosody with coarse temporal steps; this strategy is effective because prosody does not rely on fine temporal variations (c.f. §1.2) as do consonants.

An evaluation [38] demonstrates that pGSLM [32] (c.f. §4.1) achieves 88% accuracy (F1 score) in encoding and reproducing English emphasis in speech-to-speech resynthesis, compared to 42% for GSLM [39].

In addition to the generative applications above, Chi et al.’s evaluation [40] for prosody-aware tokenization supports the disentanglement objective from the comprehension side. They show that, even when prosody alone carries usable information for a task, multimodal or lexicalized systems may underuse prosodic evidence when lexical information is available and default to more obvious channels. This risk further informs the significance of disentanglement objectives, that merely making prosody available is insufficient; instead, interfaces should be designed for prosodic contrast to reliably enter the model’s decision path.

These approaches clarify that prosody should be represented as a disentangled stream whose structure is enforced by the interface rather than as residuals entangled in a space dominated by segmental information.

### 4.2 Recent advancements in comprehension-oriented prosody-aware architecture

Besides the disentanglement strategies discussed in §4.1, a broader landscape of recent architectural advancements demonstrates that actively engaging with prosodic signals provides significant gains in comprehension performance across complex tasks, ranging from dialogue classification to real-time robotic reasoning. [41] proposed a neural prosody encoder that leverages prosodic information for end-to-end dialogue act classification, using a learnable gating mechanism to assess and selectively retain critical prosodic features. [42] have explored prosody-based attention and distillation to improve end-to-end SLU. More recently, ProsodyLM [43] proposes a prosody-aware token for text-based LLMs that pairs speech transcripts with word-level prosody tokens, enabling pre-training to acquire prosody-sensitive behaviors including contrastive focus. A grounded demonstration in robotics is provided by [15], which uses prosody to infer and resolve intent in ambiguous spoken robot instructions and inject the resulting intent signal into an LLM via in-context learning to select task plans. Empirically, they report high accuracy for referent-intent detection, with their best model reaching 95.79% accuracy, and they show that providing prosody-derived intents improves disambiguation of task plans relative to an ASR-only baseline that remains at chance on the two-way ambiguity setting, with the best configuration reaching 71.96% accuracy, suggesting a concrete pathway by which prosodic structure can enter downstream reasoning rather than remaining an unused side cue.

## 5 Conclusion

In the first half of our discussion, we reviewed how focus can be recovered acoustically and motivated focus-background contrast as an important semantic cue to leverage in speech processing. The second half surveyed the current speech tokenization landscape and presented disentanglement as an emerging direction towards speech systems that efficiently engage with prosodic structures including focus-background contrast. In the long term, moving beyond acoustic-to-text transcription and adopting architectures that integrate prosodic signals as functional inputs is a necessary step toward AI systems that resolve ambiguity and operate in complex task environments with human-like efficiency and robustness.

## References

[1] X. Tan, T. Qin, F. Soong, and T. Y. Liu, "A survey on neural speech synthesis," *IEEE/ACM Trans. Audio, Speech, Lang. Process.*, vol. 29, pp. 2197–2219, 2021.

[2] D. R. Ladd, *Intonational Phonology*, 2nd ed. Cambridge, U.K.: Cambridge Univ. Press, 2008.

[3] C. Gussenhoven, *The Phonology of Tone and Intonation*. Cambridge, U.K.: Cambridge Univ. Press, 2010.

[4] J. Hirschberg and J. Pierrehumbert, “The intonational structuring of discourse,” in *Proc. 24th Annual Meeting of the Association for Computational Linguistics*, 1986, pp. 136–144.

[5] R. Banse and K. R. Scherer, “Acoustic profiles in vocal emotion expression,” *Journal of Personality and Social Psychology*, vol. 70, no. 3, pp. 614–636, 1996.

[6] A. Turk and L. Sawusch, "The domain of accentual lengthening in American English," *Journal of Phonetics*, vol. 25, no. 1, pp. 25-41, 1997.

[7] S.-W. Chen, B. Wang, and Y. Xu, “Closely related languages, different ways of realizing focus,” in *Proc. Interspeech 2009*, Brighton, U.K., Sep. 2009, pp. 1007–1010.

[8] Y. Xu, “Transmitting tone and intonation simultaneously—The Parallel Encoding and Target Approximation (PENTA) model,” in *Proc. Int. Symp. Tonal Aspects of Languages (TAL)*, Beijing, China, 2004, pp. 215–220.

[9] Y. Xu, “Post-focus compression: Cross-linguistic distribution and historical origin,” in *Proc. 17th Int. Congr. Phonetic Sciences (ICPhS XVII)*, Hong Kong, China, Aug. 2011, pp. 152–155.

[10] H. H. Rump and R. P. G. Collier, “Focus conditions and the prominence of pitch-accented syllables,” *Language and Speech*, vol. 39, no. 1, pp. 1–17, 1996.

[11] Y. Xu, S.-W. Chen, and B. Wang, “Prosodic focus with and without post-focus compression: A typological divide within the same language family?,” *The Linguistic Review*, vol. 29, pp. 131–147, 2012.

[12] W. L. Wu and Y. Xu, “Prosodic focus in Hong Kong Cantonese without post-focus compression,” in *Proc. Speech Prosody 2010*, Chicago, IL, USA, May 2010, pp. 1–4, doi: 10.21437/SpeechProsody.2010-852.

[13] S. Baumann and M. Winter, "What makes a word prominent? Predicting untrained German listeners' perceptual judgments," *Journal of Phonetics*, vol. 70, pp. 20-38, 2018.

[14] M. Rooth, “A theory of focus interpretation,” *Natural Language Semantics*, vol. 1, no. 1, pp. 75–116, 1992, doi: 10.1007/BF02342617.

[15] D. Sasu, K. A. Yamoah, B. Quartey, and N. Schluter, “Enhancing Speech Instruction Understanding and Disambiguation in Robotics via Speech Prosody,” *arXiv preprint* arXiv:2506.02057, 2025

[16] A. Cutler, D. Dahan, and W. van Donselaar, “Prosody in the comprehension of spoken language: A literature review,” *Language and Speech*, vol. 40, no. 2, pp. 141–201, 1997.

[17] D. Dahan, M. K. Tanenhaus, and C. G. Chambers, “Accent and reference resolution in spoken-language comprehension,” *Journal of Memory and Language*, vol. 47, no. 2, pp. 292–314, 2002, doi: 10.1016/S0749-596X(02)00001-3.

[18] K. Ito and S. R. Speer, “Anticipatory effects of intonation: Eye movements during instructed visual search,” *Journal of Memory and Language*, vol. 58, no. 2, pp. 541–573, 2008.

[19] S. Brouwer, C. G. van Rijn, and B. M. Lulofs, "Rational speech comprehension: Interaction between predictability, acoustic signal, and noise," *Front. Psychol.*, vol. 12, Art. no. 794324, Feb. 2022.

[20] S. L. Mattys, M. H. Davis, A. R. Bradlow, and S. K. Scott, “Speech recognition in adverse conditions: A review,” *Language and Cognitive Processes*, vol. 27, no. 7–8, pp. 953–978, 2012.

[21] K. Iwamoto *et al*., “How bad are artifacts?: Analyzing the impact of speech enhancement errors on ASR,” in *Proc. Interspeech 2022*, pp. 5418–5422, 2022.

[22] D. Wang, J. Li, M. Cui, D. Yang, X. Chen, and H. M. Meng, “Speech Discrete Tokens or Continuous Features? A Comparative Analysis for Spoken Language Understanding in SpeechLLMs,” in *Proc. Conf. Empirical Methods in Natural Language Processing (EMNLP)*, pp. 24913–24924, 2025, doi: 10.18653/v1/2025.emnlp-main.1266.

[23] Y. Guo, Z. Li, H. Wang, B. Li, C. Shao, H. Zhang, C. Du, X. Chen, S. Liu, and K. Yu, “Recent Advances in Discrete Speech Tokens: A Review,” *arXiv* preprint arXiv:2502.06490, 2025.

[24] A. Baevski, S. Schneider, and M. Auli, “vq-wav2vec: Self-Supervised Learning of Discrete Speech Representations,” in *Proc. Int. Conf. Learn. Representations (ICLR)*, 2020.

[25] A. van den Oord, O. Vinyals, and K. Kavukcuoglu, “Neural Discrete Representation Learning,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2017.

[26] N. Zeghidour, A. Luebs, A. Omran, J. Skoglund, and M. Tagliasacchi, “SoundStream: An End-to-End Neural Audio Codec,” *arXiv* preprint arXiv:2107.03312, 2021.

[27] A. Défossez, J. Copet, G. Synnaeve, and Y. Adi, “High Fidelity Neural Audio Compression,” *arXiv* preprint arXiv:2210.13438, 2022.

[28] D. Wang, M. Cui, D. Yang, X. Chen, and H. Meng, “A Comparative Study of Discrete Speech Tokens for Semantic-Related Tasks with Large Language Models,” *arXiv* preprint arXiv:2411.08742, 2024.

[29] S. Vashishth, H. Singh, S. Bharadwaj, S. Ganapathy, C. Asawaroengchai, K. Audhkhasi, A. Rosenberg, A. Bapna, and B. Ramabhadran, “STAB: Speech Tokenizer Assessment Benchmark,” *arXiv* preprint arXiv:2409.02384, 2024.

[30] W.-N. Hsu, B. Bolte, Y.-H. H. Tsai, K. Lakhotia, R. Salakhutdinov, and A. Mohamed, “HuBERT: Self-Supervised Speech Representation Learning by Masked Prediction of Hidden Units,” *arXiv* preprint arXiv:2106.07447, 2021.

[31] A. Baevski, H. Zhou, A. Mohamed, and M. Auli, “wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations,” in *Proc. Adv. Neural Inf. Process. Syst. (NeurIPS)*, 2020.

[32] E. Kharitonov *et al*., “Text-Free Prosody-Aware Generative Spoken Language Modeling,” in *Proc. ACL*, 2022.

[33] Y. Ren *et al*., “ProsoSpeech: Enhancing Prosody With Quantized Vector Pre-training in Text-to-Speech,” *arXiv preprint arXiv:2202.07816*, 2022.

[34] X. Zhang, D. Zhang, S. Li, Y. Zhou, and X. Qiu, “SpeechTokenizer: Unified Speech Tokenizer for Speech Large Language Models,” in *Proc. Int. Conf. Learn. Representations (ICLR)*, 2024.

[35] L.-H. Tseng, Y.-C. Chen, K.-Y. Lee, D.-S. Shiu, and H.-Y. Lee, “TASTE: Text-Aligned Speech Tokenization and Embedding for Spoken Language Modeling,” *arXiv preprint arXiv:2504.07053*, 2025.

[36] Y. Zheng, W. Tu, Y. Kang, J. Chen, Y. Zhang, L. Xiao, Y. Yang, and L. Ma, “FreeCodec: A Disentangled Neural Speech Codec with Fewer Tokens,” *arXiv preprint arXiv:2412.01053*, 2024.

[37] Z. Ju *et al*., “NaturalSpeech 3: Zero-Shot Speech Synthesis with Factorized Codec and Diffusion Models,” *arXiv preprint arXiv:2403.03100*, 2024.

[38] M. de Seyssel, A. D’Avirro, A. Williams, and E. Dupoux, “EmphAssess: A Prosodic Benchmark on Assessing Emphasis Transfer in Speech-to-Speech Models,” arXiv preprint arXiv:2312.14069, 2023.

[39] K. Lakhotia *et al.*, “Generative spoken language modeling from raw audio,” 2021. [Online]. Available: arXiv:2102.01192.

[40] J. Chi, M. de Seyssel, and N. Schluter, “The Role of Prosody in Spoken Question Answering,” *arXiv preprint arXiv:2502.05389*, 2025.

[41] K. Wei *et al*., “A Neural Prosody Encoder for End-to-End Dialogue Act Classification,” *arXiv preprint arXiv:2205.05590*, 2022.

[42] S. Rajaa, “Improving End-to-End SLU Performance with Prosodic Attention and Distillation,” *arXiv preprint arXiv:2305.08067*, 2023.

[43] K. Qian *et al*., “ProsodyLM: Uncovering the Emerging Prosody Processing Capabilities in Speech Language Models,” *arXiv preprint arXiv:2507.20091*, 2025.

[^1]: Also called end-to-end.

[^2]: Mind that the “semantic” here and henceforward are used broadly to mean content abstraction beyond surface form, different from the linguistics sense.

[^3]: Short for encoder-decoder. An encoder shrinks the waveform down into a small code, and a decoder tries to expand that code back into waveform.

[^4]: In RVQ, the quantization process is cascaded: after the first quantizer approximates the target, subsequent quantizers \(q_2,\ldots,q_Q\) iteratively discretize the residual error (e.g., \(r_1=h_t-q_1(h_t)\)), allowing the final representation to be a summation of vectors from multiple coarse-to-fine codebooks [25]. RVQ improves reconstruction fidelity without exponentially increasing codebook size.
