# Geometric or Rank-Based? Evaluating Alternative Distance Metrics and Layer Mixing Methods in Incremental Alternative Sampling for Psycholinguistic Data

Flora Gu and Natasha Luo

---

## 1 Introduction and Related Work

### 1.1 Context

Language comprehension is incremental in that, as each word is encountered, comprehenders update their expectations about the unfolding sentence and allocate processing effort accordingly. A robust finding in psycholinguistics is that more predictable words are processed more easily, while unexpected continuations increase behavioural and neural processing costs (Ehrlich and Rayner, 1981; Kutas and Hillyard, 1984; Smith and Levy, 2013; Kutas and Federmeier, 2011). Predictive processing therefore provides a computational bridge between linguistic context and word-level comprehension difficulty. Surprisal theory formalises this relation by linking processing effort to a word's negative log conditional probability, \(-\log p(w_t \mid w_{<t})\) (Hale, 2001; Levy, 2008). This account has been highly influential because it reduces contextual expectation to a single quantity that can be estimated with probabilistic language models. Surprisal has consequently become a standard predictor in computational psycholinguistics, explaining variance in reading times and neural responses across a range of experimental settings (Smith and Levy, 2013; Goodkind and Bicknell, 2018; Wilcox et al., 2020; Shain, 2024). However, next-word surprisal is limited as an account of predictive processing because it collapses lexical, syntactic, and semantic expectations into a single scalar.

### 1.2 Incremental alternative sampling

Incremental alternative sampling (IAS) was introduced by Giulianelli et al. (2026) as an alternative model of predictive processing in which comprehenders incrementally generate, evaluate, and update possible continuations of the current linguistic context. Unlike standard surprisal, which reduces prediction to the conditional probability of the observed next word, IAS makes explicit two dimensions of prediction: the temporal horizon over which alternatives are sampled and the representational domain in which the alternatives are compared. Processing difficulty is predicted by incremental information value, which is defined as the representational distance between alternatives sampled before and after observing a word (Equation 1). Higher information value therefore corresponds to a larger update in predictive expectations and greater processing effort.

\[
\begin{aligned}
\gamma_{p,r}(w_t;c_{<t}) &=
\mathbb{E}_{a_{\geq t} \sim p(\cdot \mid c_{<t})}
\mathbb{E}_{a_{\geq t+1} \sim p(\cdot \mid c_{<t}w_t)} \\
&\quad d_r(a_{\geq t}, w_ta_{\geq t+1}).
\end{aligned} \tag{1}
\]

IAS is operationalised with causal Transformer language models—such as GPT-2 (Radford et al., 2019) as used by Giulianelli et al. (2026)—in two roles. First, the model samples possible continuations of a partial context. Second, its hidden layers provide representational spaces in which sampled alternatives can be embedded and compared. This use of layers is theoretically useful because Transformer layers have been argued to encode different kinds of linguistic information at different depths, with lower layers more closely tied to lexical and positional information, intermediate layers to syntactic and structural information, and upper layers to highly contextualised representations. However, IAS does not require a strict one-to-one mapping between layers and linguistic levels. Rather, layers are treated as empirically testable representational resolutions.

A further modelling choice concerns the distance metric used to compare alternative representations. Giulianelli et al. (2026) use standardised cosine distance, a metric used to find the distance between two vectors by the cosine of the angle of their orientation. However, this choice is not theoretically neutral: cosine is a geometric metric, in comparison to other distance metrics such as the rank-based Spearman's R or the disparity-based Canberra distance. Different metrics encode different assumptions about what counts as a meaningful representational update. Comparing these metrics therefore tests whether human processing effort is better captured by absolute displacement, angular similarity, relative disparity, or rank-based correlation.

Giulianelli et al. (2026) evaluated IAS against several behavioural and neural measures, including self-paced reading time in the Aligned dataset and Natural Stories. In their single-resolution analyses, individual horizon-layer combinations of information value predicted several measures of processing effort, including self-paced reading times and the N400/P600 components, but individual IAS models did not uniformly outperform surprisal in specific horizon-layer combinations. However, when combining information value estimates across multiple representational layers and temporal horizons, the full IAS model outperformed surprisal for most measures. This suggests that human processing may depend on multiple predictive resolutions simultaneously rather than on a single layer or horizon.

Nevertheless, integrating information value across all GPT-2 layers risks positing an overly costly mechanism for human comprehension, given the limited computational and representational resources available during real-time processing. The present study therefore examines whether combining only two layers is sufficient to improve prediction over single-layer IAS models, and whether this improvement depends on how the mixed representation is constructed.

## 2 Method

### 2.1 Research question and design overview

The overarching research question is whether human word-level response measures align better with an IAS predictor that mixes multiple Transformer layers than with single-layer IAS predictors. More specifically, the study asks whether combining two GPT-2 layers yields a reliable gain in predictive power, and whether this gain depends on the distance metric, the method used to combine layers, and the choice of layers in a combination.

This study uses GPT-2 Small to estimate incremental information value from sampled alternatives and evaluates its ability to predict human processing effort in the Aligned dataset (De Varda et al., 2024), henceforth referred to as Aligned. All analyses are restricted to horizon = 1 and POS = 1. The study consists of two experiments: Experiment 1 compares the predictive power of different distance metrics across individual GPT-2 layers, while Experiment 2 tests whether two-layer representations improve prediction over single-layer models and whether this depends on the method of layer mixing.

Hypotheses:
- Experiment 1:
    - \(H_0\): distance metric does not have statistically significant effect on IAS predictive power.
    - \(H_A\): IAS prediction is dependent on distance metric.
- Experiment 2:
    - \(H_0\): for all distance metrics, mixed layer representation does not show statistically significant gain over baseline.
    - \(H_A\): for some distance metric, mixed layer representation shows statistically significant gain over baseline.

### 2.2 Scope and simplifications relative to Giulianelli et al. (2026)

Due to time and computation resource constraints, we have made several simplifications in design choices and thus narrowed down the scope of our study from Giulianelli et al. (2026). In the aforementioned study, the authors estimate information value using 50 sampled alternatives and vary both forecast horizon and representation layer. The present study uses a smaller alternative sample size of 20 to reduce computational cost while preserving the core IAS procedure of comparing alternatives sampled before and after the target word. We are also interested in whether the trend observed in Giulianelli et al. (2026) remains robust with a smaller sampling size.

The analysis also fixes part of speech (POS)/word position as 1. This removes word-position as a source of variance and allows all models to be compared under the same local processing condition. The trade-off is that the results should not be interpreted as general claims about all word positions or longer sentential contexts.

The analysis is further restricted to horizon = 1. This means that the study examines immediate next-word prediction rather than longer-range predictive updates. This choice is appropriate because the main goal is not to test temporal resolution, but to isolate how representational comparison and layer mixing affect IAS prediction under a fixed temporal setting. Other horizons may show different findings. Giulianelli et al. (2026) shows horizon 1–3 often yields very different predictions, while horizon \(\geq\) 3 is more uniform.

Giulianelli et al. (2026) used both Natural Stories (Futrell et al., 2017) and Aligned corpora (De Varda et al., 2024) for self-paced reading time. Our analysis was only based on Aligned. This simplification should limit the scope of generalization, because Giulianelli et al. (2026) showed that the two dataset yield different results. In the full IAS model, the largest relative gap between IAS and surprisal occurs for self-paced reading times in Natural Stories, while the difference for Aligned self-paced reading times is not statistically significant. In interpreting this difference, Giulianelli et al. (2026) suggested Natural Stories differs from Aligned in ways that should make longer-range prediction more relevant. Aligned uses short, sentence-level stimuli, with sentences only 5–15 words long and self-paced reading collected in a stationary-window paradigm; whereas Natural Stories contains much longer multi-sentence narrative texts, with richer syntactic constructions and discourse context. In addition, Natural Stories was collected in a moving-window display for which the length of upcoming and preceding text is visible to the subject. For this study, since we have fixed POS and horizon to 1, Natural stories should not differ much from Aligned, so we only included Aligned.

## 3 Experiment 1

### 3.1 Design

Experiment 1 evaluates whether the predictive power of IAS depends on the distance metric used to compare GPT-2 representations. All estimates were computed using GPT-2 Small and the Aligned dataset. Following the simplified scope defined in the Method section, the analysis was restricted to horizon = 1 and POS = 1. The experiment used a \(3 \times 5 \times 13\) factorial design crossing response type (3), distance metric (5), and GPT-2 layers (13).

The response types were self-paced reading time, N400 amplitude, and P600 amplitude. This choice extends the analysis beyond explicit predictability measures such as cloze probability. Giulianelli et al. (2026) show that IAS is strongly predictive of cloze probability and related predictability judgments, but predictability is not equivalent to processing effort. A model can capture which words are expected without fully capturing the behavioural or neural cost of processing those words. The present experiment therefore focuses on response measures that more directly index online comprehension difficulty. Self-paced reading time provides a behavioural measure of word-by-word processing effort, since longer response times are taken to reflect increased difficulty in integrating the current word into the preceding context. The two ERP measures were included because they provide complementary neural indices of linguistic processing. The N400 is commonly associated with semantic predictability (Kutas and Hillyard, 1984), whereas the P600 has been linked to syntactic integration processes (Kaan et al., 2000). These components are therefore relevant for testing whether different distance metrics over GPT-2 representations capture distinct aspects of processing difficulty. Giulianelli et al. (2026) also found that among ERP components, IAS showed significant predictive power specifically for N400 and P600: N400 was best predicted by distances between zero-th-layer representations, while P600 was most strongly associated with low-intermediate layers. As such, we are interested in whether this finding holds across distance metrics.

The five distance metrics (Table 1) are Euclidean distance, standardised Euclidean distance, cosine distance, Canberra distance (Lance and Williams, 1967), and Spearman's rank correlation distance (Spearman, 1904). For each metric, incremental information value was computed separately at each of the twelve GPT-2 layers. This yielded 60 single-layer IAS predictors for each response type. The purpose of this design was to determine whether IAS prediction is robust across distance metrics, or whether predictive power depends on the property of the metric.

|  | **Euclidean** | **Standard Euclidean** | **Cosine** | **Canberra** | **Spearman R** |
|---|---|---|---|---|---|
| Equation | \(\sqrt{\sum_i (x_i-y_i)^2}\) | \(\sqrt{\sum_i \frac{(x_i-y_i)^2}{\sigma_i^2}}\) | \(1-\frac{x\cdot y}{\lVert x\rVert\lVert y\rVert}\) | \(\sum_i \frac{|x_i-y_i|}{|x_i|+|y_i|}\) | \(1-\rho\) |
| Property | Absolute geometric displacement | Variance-adjusted displacement | Geometric angular similarity | Relative dimension-wise disparity | Dimension-wise ranked-based correlation |
| Complexity | \(O(k^2d)\) | \(O(k^2d)\) | \(O(k^2d)\) | \(O(k^2d)\) | \(O(k^2d\log d)\) |

*Table 1: Distance metrics. Sampling size \(k = 20\); embedding dimensionality \(d = 768\).*

### 3.2 Analysis

In order to compare the usefulness of each distance metric, the following linear regression models were constructed: a baseline model containing only the control variables (independent variable: self-paced reading time/P600/N400; dependent variables: word length, and log frequency of word) to explain human behavior; a model for each independent layer that includes the control variables plus one distance metric for each independent psycholinguistic variable (13 layers x 5 distance metrics across 3 IVs; 195 models total). Then, these models are compared to one another based on the difference in adjusted \(R^2\), whereas a higher \(R^2\) indicates that a model explains more variance of the data of human behavior (self-paced reading time, P600, or N400). The second token/word of each item is considered, and therefore only the data from horizon = 1 is accounted for within these linear regression models. This procedure is modified from Giulianelli et al. (2026) with the crucial difference that the word position is not considered in the linear regression models as a dependent variable because of the fact that only position, the second token, is fixed. Table 2 below summarizes the variables considered in the linear regression model.

|  | **Baseline models** | **Single Layers models (13 layers x 5 metrics)** |
|---|---|---|
| Self-paced reading time | \(\sim\) word length + log frequency | word length + log frequency + [z-scores of distance metric] + [layer] |
| P600 | \(\sim\) word length + log frequency | word length + log frequency + [z-scores of distance metric] + [layer] |
| N400 | \(\sim\) word length + log frequency | word length + log frequency + [z-scores of distance metric] + [layer] |

*Table 2: Experiment 1: linear regression models for the comparison of \(\Delta R^2\) across layers and metrics. The variables for the baseline models are formatted as the independent variable \(\sim\) dependent predictor variables (or \(y \sim x_1 + x_2 \ldots\)), as in the R language.*

### 3.3 Results for Experiment 1

The adjusted \(R^2\) value of the baseline model for self-paced reading time is 0.0079, meaning that 0.79% of the variance within the model can be explained by the control variables, word length and log frequency. For the baseline models of P600 and N400, it is -0.0076 and -0.0057, respectively. Overall, the mean \(\Delta R^2\) for the self-paced RT models across the 13 layers is 0.0004; for the P600 models, it is 0.0041; and for the N400 models, it is -0.0015.

*Figure 1: Difference in \(R^2\) between the baseline model and linear models across layers and metrics. The heatmaps in this paper are colored so that the maximum value is red, minimum value is green, and the 50th percentile is white.* (The figure image is not included on this page.)

The heatmaps in Figure 1 shows the change in adjusted \(R^2\) values from the baseline model to each of the 65 single-layer models by metrics, shows the main finding of the current study:

In the self-paced reading time models, only the Spearman's R models have a consistently positive \(\Delta R^2\) across all layers. While both Standard Euclidean and Canberra are more mixed, the \(\Delta R^2\) values from the Canberra distance are generally slightly positive. In contrast, the \(\Delta R^2\) of the Euclidean and cosine metrics are consistently negative with the exception of layer 8 for Euclidean and layer 3 for cosine distance.

The above conclusion does not hold for the P600 and N400 models. For P600, Euclidean is the overall best performing metric, consistently scoring better than other metrics across all layers, although cosine outperforms Euclidean on some shallow layers (layers 0–2). For N400, cosine is the overall best performing metric, with layer 12 having a \(\Delta R^2\) of 0.024. Notwithstanding, most other layers across metrics show negative \(\Delta R^2\).

A general trend to note is that deeper transformers layers generally produced more positive \(\Delta R^2\) values. For the self-paced reading time models, Standardized Euclidean, Canberra, and Spearman—the non-negative metrics—layer 12 always represented the largest increase in \(\Delta R^2\) compared to other layers. Conversely, layer 1 always produced a negative \(\Delta R^2\) value, except for the Spearman's R distances. This suggests that deeper contextual layers may be more strongly associated with self-paced reading times. Similarly, for both P600 and N400, there is a trend that non-negative distance metrics generally observe greater \(\Delta R^2\) at greater processing depth. This trend is more consistent in P600, while N400 sees the greatest \(\Delta R^2\) at middle to upper-middle layers for Canberra and Spearman.

### 3.4 Discussions

Considering that the overall \(\Delta R^2\) mean of the N400 models is negative (-0.0015), it suggests that, across distance metrics, IAS do not contribute meaningfully to the model compared to the baseline models. This is contrary to the results from Giulianelli et al. (2026), who found consistently positive and significant \(\Delta R^2\), especially at horizons 1 and 2. Given that both the self-paced reading time and P600 has positive mean \(\Delta R^2\), this has particular implications for the role of semantics/N400 in these linear models where they do not follow the overall pattern.

In general, the results suggest that Spearman's R improves the model from the baseline for self-paced reading time more consistently than Euclidean or cosine distances. In contrast, P600 and N400 both have a greater \(\Delta R^2\) in Euclidean and cosine, potentially meaning that different psycholinguistic variables prefer certain distance metrics. It is important to note that both Euclidean and cosine are geometric distances, which could explain their shared properties across the three independent variables.

## 4 Experiment 2

### 4.1 Design

Experiment 2 tests whether mixed-layer representations improve IAS prediction of human processing effort relative to single-layer representations. The experiment uses the same corpus, model, forecast horizon, and word-position restriction as Experiment 1: information value was estimated from GPT-2 Small representations over the Aligned dataset, with horizon = 1 and POS = 1. The response variable was self-paced reading time. Because P600 and N400 showed distinct metric- and layer-specific patterns in Experiment 1, mixed-layer analyses for ERP responses are left outside the present experiment and treated as a target for future work. For this reason, the results can only be generalized to self-paced reading time specifically.

The experiment used a \(3 \times 2 \times 6\) factorial design crossing distance metric (3), layer-mixing method (2), and layer combination (6). The three distance metrics were standardised Euclidean distance, cosine distance, and Spearman's rank correlation distance. Standardised Euclidean distance was included as a variance-adjusted geometric metric, allowing representational displacement to be measured while reducing the influence of high-variance embedding dimensions. Cosine distance was included as an angular metric and as the closest comparison to the standardised cosine distance used by Giulianelli et al. (2026). Spearman distance was included because Experiment 1 suggested that self-paced reading time may be especially sensitive to rank-based representational reorganisation rather than only to geometric displacement. Together, these metrics test whether mixed-layer benefits depend on the type of representational structure being compared.

Two mixing methods were compared: output-level mixing and embedding-level mixing. For both methods, two layers were mixed and the mixing weights were fixed at 0.5 and 0.5. In output-level mixing, information value is computed separately for each layer in a pair and the two resulting z-scores of IAS distance metrics are then averaged with equal weights to create the z-score (\(z\)) of the mixed layer combination (Equation 2). This method preserves each layer's representational geometry before integration. The z-scores are calculated from the mean and standard distribution of each distance metric across all layers in order to be able to compare between the metrics on the same scale, given that each distant metric has different possible min./max. values pre-normalization. Compared with a single-layer IAS predictor, output-level mixing requires two distance computations. For Euclidean-type and cosine metrics, this doubles the constant cost of the pairwise distance calculation while preserving the same asymptotic form, \(O(k^2d)\) where \(k\) is the number of sampled alternatives and \(d\) is embedding dimensionality. For Spearman distance, the corresponding cost is also approximately doubled, including the ranking step required for each layer.

\[
z_{layer\ 1+2}=\frac{z_{layer\ 1}+z_{layer\ 2}}{2} \tag{2}
\]

In embedding-level mixing, the two layer embeddings are averaged before the distance function is applied (Equation 3). To define a mixed-layer representation \(r\) under model \(\theta\), choose two layers \(l_1 \neq l_2\) and a mixing coefficient \(\alpha\in[0,1]\). For any continuation \(a\) define:

\[
r_{\theta,(l_1,l_2),\alpha}(a)=\alpha r_{\theta,l_1}(a)+(1-\alpha)r_{\theta,l_2}(a) \tag{3}
\]

Information value is then computed once over the mixed embedding space. This method is therefore closer in distance-computation cost to a single-layer IAS predictor: it requires extracting two layer representations and averaging them, but only one pairwise distance calculation. For non-rank metrics, the additional averaging cost is linear in the number and dimensionality of alternative embeddings and is small relative to the \(O(k^2d)\) pairwise comparison. For Spearman distance, ranks are computed once for the mixed representation rather than once per layer. Thus, embedding-level mixing is computationally cheaper than output-level mixing, but it may also obscure layer-specific structure by combining embeddings before representational distance is measured.

The six layer combinations were divided into intermediate and wide combinations. The intermediate combinations were (3,6), (3,9), and (6,9). These pairs focus on the middle range of GPT-2 Small, where prior work reviewed by Giulianelli et al. (2026) associates Transformer representations with syntactic and structural information. Syntactic information is most prominent in intermediate layers (Jawahar et al., 2019), while lower layers are more lexical or positional and final layers are more specialised for next-word prediction (Tenney et al., 2019). These combinations are therefore designed to test whether mixing nearby or moderately separated structural representations improves prediction of self-paced reading time.

The wide combinations were (0,6), (6,12), and (0,12). These pairs test whether predictive gains arise from combining more distinct representational resolutions: layer 0 as a decontextualised lexical representation, layer 6 as an intermediate structural representation, and layer 12 as a highly contextualised prediction-oriented representation. The wide combinations therefore test whether broader representational contrast is beneficial, especially when combining lexical, structural, and contextual information.

### 4.2 Analysis

| **Distance Metric** | **Output-Level Layer Mixing (OM)** | **Embedding-Level Layer Mixing (EM)** |
|---|---|---|
| S. Euclidean | baseline + SEuclidean OM IAS | baseline + SEuclidean EM IAS |
| Cosine | baseline + Cosine OM IAS | baseline + Cosine EM IAS |
| Spearman | baseline + Spearman OM IAS | baseline + Spearman EM IAS |

*Table 3: Experiment 2: linear regression models to compare \(\Delta R^2\) across metrics and mixing methods. The baseline model is the same as the one in Experiment 1: self-paced reading time \(\sim\) word length + log frequency.*

### 4.3 Results

As with Experiment 1, the adjusted \(R^2\) value of the baseline model is 0.0079. The mean change of the adj. \(R^2\) of the output-level layer mixing methods is 0.0021, while it is -0.0051 for the embedding-level layer mixing method.

*Figure 2: Heatmaps of \(\Delta R^2\) across layer combinations and distance metric for each mixing method.* (The figure image is not included on this page.)

Because of the aforementioned mean adjusted \(\Delta R^2\), where the embedding-level layer mixing method has a negative value, the output-level mixing outperforms embedding-level mixing. For intermediate layer combinations, mixing methods do not noticeably affect model fittedness. However, for wide layer combinations, the performance difference is noticeably larger, with output-level mixing outperforming embedding-level mixing in standardized Euclidean and Spearman.

Output-level mixing sees the most significant improvement from baseline in Spearman and especially when the layers combined are farther away from each other, with the 0+12 combination scoring the best; within Spearman's R, this trend is not observed for embedding-level mixing, where the farther combinations show a negative \(\Delta R^2\).

### 4.4 Discussion

If the mean is compared, the output-level mixing is 0.0021 while the single-layer models for self-paced RT is 0.0004, which would imply that the output-level mixing models align with self-paced RT data closer than the single layer models. However, the best-case performance (max \(\Delta R^2\)) of mixed-layer (distance = Spearman, layer 12, where \(\Delta R^2\) = 0.016) does not outperform the best of single layer (distance = Spearman, layer 12, where \(\Delta R^2\) = 0.0211), where the independent psycholinguistic variable is self-paced reading times for both the mixed-layer models and the single layer models. Note that both of these maximums are layer 12 and use the same distance metric of Spearman's R, which is consistent with one another.

When considering the interaction of layer combination and mixing method, it seems that intermediate layer combinations behave similarly to each other across the two mixing methods. For example, for layers 3+6, for both methods using Standard Euclidean, the \(\Delta R^2\) is -0.0002; for layers 6+9, it is either 0.0004 or 0.0003; and for layer 3+9, it is either 0.0001 or 0. The same could be said for the cosine and Spearman's R.

However, the wide layer combinations show a different pattern, where not only the output-level mixing clearly outperforms the embedding-level mixing, but the preferred distance metric is also different between the mixing methods. Particularly interesting is the result that Spearman's R outperforms the other distance metrics for the output-level mixing method, whereas it is the opposite in embedding-level mixing. For output-level mixing, both Standard Euclidean and cosine have negative values, whereas in the embedding-level, it is Standard Euclidean and Spearman's R instead.

A possible conjecture of why output-level mixing outperforms embedding-level mixing is that output-mixing preserves the geometry of each individual layer's vector space. Because it is known that the different layers map onto different linguistic domains, if the embedding-level mixing averages the vectors first, the orientations' cancellation may not accurately represent the linguistic domains involved in the behavioral data.

## 5 Conclusion

The present study examined whether the predictive power of incremental alternative sampling depends on the distance metric used to compare GPT-2 representations, and whether combining two Transformer layers improves the prediction of human word-level processing effort. Across both experiments, the results suggest that IAS performance is sensitive to representational comparison choices. Experiment 1 showed that distance metric affected predictive power differently across response types. Experiment 2 tested whether two-layer mixed representations improve prediction over single-layer IAS predictors for self-paced reading time. The results provide partial support for the alternative hypothesis. Taken together, these findings refine the interpretation of IAS as a model of predictive processing. Giulianelli et al. (2026) showed that IAS can capture prediction across multiple temporal horizons and representational resolutions, and that the full IAS model often outperforms surprisal across behavioural and neural measures. The present study narrows this question to a more restricted setting: GPT-2 Small, Aligned, horizon = 1, POS = 1, and a smaller sample of alternatives. Within this restricted setting, the results suggest that the distance metric and the method of layer integration both affect how well IAS aligns with human processing data.

The main measurement used in this paper is the change in adjusted \(R^2\) from a baseline model, following the general evaluation logic of Giulianelli et al. (2026). Although this is an effective descriptive measure for comparing models, the observed \(\Delta\)Adj.\(R^2\) values are relatively small across experiments. This is not unexpected given the high variability of behavioural data such as self-paced reading time, but it means that the results should be interpreted cautiously. In this study, \(\Delta\)Adj.\(R^2\) is treated primarily as a descriptive index of model fit rather than as a basis for strong inferential claims.

A further limitation is that no statistical test was applied to compare \(\Delta\)Adj.\(R^2\) values across distance metrics, layers, or mixing methods. Standard statistical tests would be inappropriate without further modelling because the design is nested: the same stimuli contribute to multiple models, so observations are not independent. Treating them as independent would risk deflated \(p\)-values and inflated Type I error. A resampling-based approach, such as bootstrapping (Kulkarni et al., 2022), would be more appropriate, but this was outside the scope of the present study because of computational constraints and the large number of models in Experiments 1 and 2.

Future work should extend the present analysis to other forecast horizons and word positions, especially horizons greater than one, since Giulianelli et al. (2026) found that short and longer horizons can produce different predictive patterns. Mixed-layer representations should also be tested for response types beyond self-paced reading time, especially N400 and P600, since Experiment 1 suggests that these ERP components are sensitive to different distance metrics and representational layers. In addition, future work could test more layer combinations, unequal mixing weights, and alternative layer-integration methods. Finally, applying the same analysis to Natural Stories would be useful, because Giulianelli et al. (2026) found stronger IAS advantages for self-paced reading in naturalistic, multi-sentence stimuli than for the Aligned self-paced reading data.

## Code Availability

Dataset and Scripts: https://github.com/flor-g/PLIN0072_project_IAS/

## Use of Tools

We acknowledge that AI tools, including Gemini, ChatGPT, and OpenAI Codex IDE extension, have been used with coding and grammar. They have not been used to generate the content of the report. Our work is based on the codebase of Giulianelli et al. (2026); Python 3 has been used in VS Code IDE to implement the embedding-level layer mixing logic. R Studio was used for statistical analysis.

## Authorship Contributions Statement (CRediT)

**Flora Gu**: Conceptualization, Data curation, Project administration, Resources, Software, Validation, Writing—Original draft, Writing—Reviewing and Editing

**Natasha Luo**: Conceptualization, Formal Analysis, Data curation, Investigation, Methodology, Software, Visualization, Writing—Original draft, Writing—Reviewing and Editing

## References

A. G. De Varda, Marco Marelli, and Simona Amenta. 2024. Cloze probability, predictability ratings, and computational estimates for 205 English sentences, aligned with existing EEG and reading time data. *Behavior Research Methods*, 56(5):5190–5213.

S. F. Ehrlich and Keith Rayner. 1981. Contextual effects on word perception and eye movements during reading. *Journal of Verbal Learning and Verbal Behavior*, 20(6):641–655. https://doi.org/10.1016/S0022-5371(81)90220-6.

Richard Futrell, Edward Gibson, Harry Tily, Idan Blank, Anastasia Vishnevetsky, Steven T. Piantadosi, and Evelina Fedorenko. 2017. The Natural Stories Corpus. https://doi.org/10.48550/arxiv.1708.05763.

Mario Giulianelli, Sarenne Wallbridge, Ryan Cotterell, and Raquel Fernández. 2026. Incremental alternative sampling as a lens into the temporal and representational resolution of linguistic prediction. *Journal of Memory and Language*, 148:104715. https://doi.org/10.1016/j.jml.2025.104715.

Adam Goodkind and Klinton Bicknell. 2018. Predictive power of word surprisal for reading times is a linear function of language model quality. In *Proceedings of the 8th Workshop on Cognitive Modeling and Computational Linguistics*, pages 10–18. https://doi.org/10.18653/v1/W18-0102.

John Hale. 2001. A probabilistic Earley parser as a psycholinguistic model. In *Second Meeting of the North American Chapter of the Association for Computational Linguistics*. https://aclanthology.org/N01-1021/.

Ganesh Jawahar, Benoît Sagot, and Djamé Seddah. 2019. What Does BERT Learn about the Structure of Language? In *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, pages 3651–3657. https://doi.org/10.18653/v1/P19-1356.

Edith Kaan, Anthony Harris, Edward Gibson, and Phillip Holcomb. 2000. The P600 as an index of syntactic integration difficulty. *Language and Cognitive Processes*, 15(2):159–201. https://doi.org/10.1080/016909600386084.

Rajesh U. Kulkarni, Carolyn L. Wang, and Carolyn R. Bertozzi. 2022. Analyzing nested experimental designs—A user-friendly resampling method to determine experimental significance. *PLoS Computational Biology*, 18(5):e1010061. https://doi.org/10.1371/journal.pcbi.1010061.

Marta Kutas and Kara D. Federmeier. 2011. Thirty Years and Counting: Finding Meaning in the N400 Component of the Event-Related Brain Potential (ERP). *Annual Review of Psychology*, 62(1):621–647. https://doi.org/10.1146/annurev.psych.093008.131123.

Marta Kutas and Steven A. Hillyard. 1984. Brain potentials during reading reflect word expectancy and semantic association. *Nature*, 307(5947):161–163. https://doi.org/10.1038/307161a0.

G. N. Lance and W. T. Williams. 1967. A General Theory of Classificatory Sorting Strategies: 1. Hierarchical Systems. *The Computer Journal*, 9(4):373–380. https://doi.org/10.1093/comjnl/9.4.373.

Roger Levy. 2008. A noisy-channel model of human sentence comprehension under uncertain input. In *Proceedings of the 2008 Conference on Empirical Methods in Natural Language Processing*, pages 234–243. Association for Computational Linguistics. https://aclanthology.org/D08-1025.pdf.

Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever, et al. 2019. Language models are unsupervised multitask learners. *OpenAI Blog*, 1(8):9. https://d4mucfpksywv.cloudfront.net/better-language-models/language-models.pdf.

Cory Shain. 2024. Word Frequency and Predictability Dissociate in Naturalistic Reading. *Open Mind: Discoveries in Cognitive Science*, 8:177–201. https://doi.org/10.1162/opmi_a_00119.

Nathaniel J. Smith and Roger Levy. 2013. The effect of word predictability on reading time is logarithmic. *Cognition*, 128(3):302–319. https://doi.org/10.1016/j.cognition.2013.02.013.

Charles Spearman. 1904. The Proof and Measurement of Association between Two Things. *The American Journal of Psychology*, 15(1):72–101. https://doi.org/10.2307/1412159.

Ian Tenney, Dipanjan Das, and Ellie Pavlick. 2019. BERT Rediscovers the Classical NLP Pipeline. https://doi.org/10.48550/arxiv.1905.05950.

Ethan G. Wilcox, Jon Gauthier, Jennifer Hu, Peng Qian, and Roger Levy. 2020. On the Predictive Power of Neural Language Models for Human Real-Time Comprehension Behavior. https://doi.org/10.48550/arxiv.2006.01912.
